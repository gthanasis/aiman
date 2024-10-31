/*-
 *
 *  ai_cli - readline wrapper to obtain a generative AI suggestion
 *
 *  Copyright 2023-2024 Diomidis Spinellis
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

#define _GNU_SOURCE

#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>
#include <readline/readline.h>
#include <readline/history.h>

#include "config.h"
#include "support.h"

#include "fetch_anthropic.h"
#include "fetch_hal.h"
#include "fetch_llamacpp.h"
#include "fetch_openai.h"

/*
 * Dynamically obtained pointer to readline(3) variables..
 * This avoids a undefined symbol errors when a program isn't linked with
 * readline.
 */
static char **rl_line_buffer_ptr;
static int *rl_end_ptr;
static int *rl_point_ptr;
static Keymap vi_movement_keymap_ptr;
static int *history_length_ptr;

// Loaded configuration
static config_t config;

// API fetch function, e.g. acl_fetch_openai or acl_fetch_llamacpp

static char * (*fetch)(config_t *config, const char *prompt, int history_length);
char *convert_escape_sequences(const char *str);

/*
 * Add the specified prompt to the RL history, as a comment if the
 * comment prefix is defined.
 * Return the length of the added comment.
 */
static int
add_commented_prompt_to_history(const char *prompt)
{
	if (prompt == NULL)
		return 0;

	if (!config.prompt_comment_set) {
		add_history(prompt);
		return 0;
	}

	char *commented_prompt;
	acl_safe_asprintf(&commented_prompt, "%s %s", config.prompt_comment,
	    prompt);
	add_history(commented_prompt);
	rl_replace_line(commented_prompt, 0);
	*rl_point_ptr = *rl_end_ptr;
	rl_redisplay();
	free(commented_prompt);
	return strlen(config.prompt_comment);
}

/*
 * The user has asked for AI to be queried on the typed text.
 * Output the response directly to the terminal, interpreting ANSI escape codes.
 */
static int
query_ai(int count, int key)
{
    static char *prev_response;

    // Free the previous response if it exists
    if (prev_response) {
        free(prev_response);
        prev_response = NULL;
    }

    // Add the current prompt to the history, as a comment if configured
    int comment_len = add_commented_prompt_to_history(*rl_line_buffer_ptr);

    // Fetch the response from the AI
    char *response = fetch(&config, *rl_line_buffer_ptr + comment_len, *history_length_ptr);

    // If the response is NULL, there was an error, so return -1
    if (!response)
        return -1;

    // Convert escape sequences in the response
    char *converted_response = convert_escape_sequences(response);

    // Output the converted response directly to the terminal
    // Ensure to reset all ANSI sequences afterwards to prevent color bleeding
    printf("%s\033[0m\n", converted_response);
    fflush(stdout);

    // Free the converted response if different from original
    if (converted_response != response) {
        free(converted_response);
    }

    // Save the original response for freeing later
    prev_response = response;

    // Clear the undo list to prevent readline from restoring the original line in history
    rl_free_undo_list();

    return 0;
}

/*
 * Converts escape sequences in the provided string.
 * Returns a newly allocated string with the modified content.
 */
char *convert_escape_sequences(const char *str) {
    size_t len = strlen(str);
    char *output = malloc(len + 1);
    if (!output)
        return NULL;

    const char *src = str;
    char *dst = output;

    while (*src) {
        // Look for double backslashes followed by '033' and replace it with the actual escape character
        if (src[0] == '\\' && src[1] == '0' && src[2] == '3' && src[3] == '3') {
            *dst++ = '\033';
            src += 4;
        } else if (src[0] == '\\' && src[1] == 'n') {
            *dst++ = '\n';
            src += 2;
        } else {
            *dst++ = *src++;
        }
    }
    *dst = '\0';

    return output;
}



/*
 * This is called when the dynamic library is loaded.
 * If the program is linked with readline(3),
 * read configuration and set keybindings for AI completion.
 */
#ifndef UNIT_TEST
__attribute__((constructor)) static
#endif
void
setup(void)
{
	/*
	 * See if readline(3) is linked and obtain required symbols
	 * This avoids undefined symbol errors for programs not
	 * using readline and also the initialization overhead.
	 */
	dlerror();
	rl_line_buffer_ptr = dlsym(RTLD_DEFAULT, "rl_line_buffer");
	if (dlerror())
		return; // Program not linked with readline(3)

	/*
	 * GNU awk 5.2.1 under Debian bookworm and maybe also other
	 * versions is distributed with a persistent memory allocator (PMA)
	 * library, which requires initialization with pma_init
	 * before using it.  If the allocator is not initialized calls
	 * to malloc will (such as those * made by rl_add_defun() in this
	 * function) will fail with a fatal error, such as the following.
	 * (null): fatal: node.c:1075:more_blocks: freep: cannot allocate
	 * 11200 bytes of memory: [unrelated error message]
	 * To avoid this problem, exit if called from awk.
	 * In the future more programs may need to get deny-listed here.
	 */
	const char *program_name = acl_short_program_name();
	if (strcmp(program_name, "awk") == 0
	    || strcmp(program_name, "gawk") == 0)
		return;

	// Obtain remaining variable symbols
	rl_end_ptr = dlsym(RTLD_DEFAULT, "rl_end");
	rl_point_ptr = dlsym(RTLD_DEFAULT, "rl_point");
	vi_movement_keymap_ptr = dlsym(RTLD_DEFAULT, "vi_movement_keymap");
	history_length_ptr = dlsym(RTLD_DEFAULT, "history_length");

	acl_read_config(&config);

	if (!config.prompt_system) {
		fprintf(stderr, "No default ai-cli configuration loaded.  Installation problem?\n");
		return;
	}

// Require a given configuration value
#define REQUIRE(section, value) do { \
	if (!config.section ## _ ## value ## _set) { \
		fprintf(stderr, "Missing %s value in [%s] configuration section.\n", #value, #section); \
		return; \
	} \
} while (0);

	REQUIRE(general, api);

	if (strcmp(config.general_api, "openai") == 0) {
		fetch = acl_fetch_openai;
		REQUIRE(openai, key);
		REQUIRE(openai, endpoint);
	} else if (strcmp(config.general_api, "anthropic") == 0) {
		fetch = acl_fetch_anthropic;
		REQUIRE(anthropic, key);
		REQUIRE(anthropic, endpoint);
		REQUIRE(anthropic, version);
	} else if (strcmp(config.general_api, "hal") == 0) {
		fetch = acl_fetch_hal;
	} else if (strcmp(config.general_api, "llamacpp") == 0) {
		fetch = acl_fetch_llamacpp;
		REQUIRE(llamacpp, endpoint);
	} else {
		fprintf(stderr, "Unsupported API: [%s].\n", config.general_api);
		return;
	}
	if (config.general_verbose)
		fprintf(stderr, "API set to %s\n", config.general_api);

	// Add named function, making it available to the user
	rl_add_defun("query-ai", query_ai, -1);

	/*
	 * Bind the function to Emacs and vi.
	 * Programs linked with libedit (editline) lack rl_bind_keyseq and
	 * will fail if it's executed. To avoid this, first test if the
	 * function i* s available.
	 */
	if (config.binding_emacs && dlsym(RTLD_DEFAULT, "rl_bind_keyseq"))
		rl_bind_keyseq(config.binding_emacs, query_ai);
	if (config.binding_vi)
		rl_bind_key_in_map(*config.binding_vi, query_ai, vi_movement_keymap_ptr);
}
