![Build Status](https://img.shields.io/github/actions/workflow/status/dspinellis/ai-cli/main.yml?branch=main)

# AI-CLI: AI help for CLI programs
The __ai_cli__
library detects programs that offer interactive command-line editing
through the __readline__ library,
and modifies their interface to allow obtaining help from OpenAI's
GPT large language model.
Think of it as a command line copilot.


![Demonstration](https://gist.githubusercontent.com/dspinellis/b25d9b3c3e6d6a6260774c32dc7be817/raw/dc36cc01806903dce0630642d3c662e02d16e7f1/ai-cli.gif)

## Build
The __ai_cli__
library has been built and tested under Debian Linux.
In addition to _make_ and the GNU C library,
the following packages are required:
`libcurl4`
`libcurl4-openssl-dev`
`libjansson4`
`libjansson-dev`
`libreadline-dev`.
Package names may be different on other systems.

```
cd src
make
```

## Test

```
cd src
make unit-test
```

## Install

```
cd src

# Global installation
sudo make install

# Local installation
make install PREFIX=~
```

## Run

* Set the `LD_PRELOAD` environment variable to load the library using its
  full path.
  For example, under _bash_ run
  `export LD_PRELOAD=/home/myname/lib/ai_cli.so`.
* [Obtain your OpenAI API key](https://platform.openai.com/signup),
  and configure it in the `.aicliconfig` file in your home directory.
  This is done with a `key=value` entry in the file's `[openai]` section.
  See the file `ai-cli-config` to understand how configuration
  files are structured.
  Note that OpenAI API access requires a different (usage-based)
  subscription from the ChatGPT one.
  OpenAI currently provides free trial credits to new users.
* Run the interactive command-line programs, such as
  _bash_, _mysql_, _psql_, _gdb_, as you normally would.
* To obtain AI help, enter a prompt and press `^X-a` (Ctrl-X followed by a)
  in the (default) _Emacs_ key binding mode or `V` if you have configured
  _vi_ key bindings.


## Reference documentation

The _ai-cli_ reference documentation is provided as Unix manual
pages.
* [ai-cli(7) — library](https://dspinellis.github.io/manview/?src=https%3A%2F%2Fraw.githubusercontent.com%2Fdspinellis%2Fai-cli%2Fmain%2Fsrc%2Fai_cli.7&name=ai_cli(7)&link=https%3A%2F%2Fgithub.com%2Fdspinellis%2Fai-cli)
* [ai-cli(5) — configuration](https://dspinellis.github.io/manview/?src=https%3A%2F%2Fraw.githubusercontent.com%2Fdspinellis%2Fai-cli%2Fmain%2Fsrc%2Fai_cli.5&name=ai_cli(5)&link=https%3A%2F%2Fgithub.com%2Fdspinellis%2Fai-cli)


## Contribute

Contributions are welcomed through GitHub pull requests.
Before working on something substantial,
open an issue to signify your interest and coordinate with others.
Particular useful are:
* prompts for systems not yet supported
  (see the [ai-cli-config](src/ai-cli-config) file),
* support for other large language models
  (start from the [OpenAI_fetch.c](src/openai_fetch.c) file),
* support for other libraries (mainly [libedit](http://cvsweb.netbsd.org/bsdweb.cgi/src/lib/libedit/)),
* ports to other platforms, such as macOS.