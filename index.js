#!/usr/bin/env node
import * as core from "@actions/core";
import * as YAML from "yaml";
import { $ } from "execa";
import { temporaryWrite } from "tempy";
import { parse as envParse } from "dotenv";
import envStringify from "dotenv-stringify";

const controller = {
  async spawn(cmd, args = [], options = {}) {
    const { env = {} } = options;
    const envFile = temporaryWrite(envStringify(env));
    return $`docker exec --env-file ${envFile} ${[cmd].concat(args)}`;
  },
};

if (process.env.WORKFLOW) {
  runWorkflow(controller);
} else {
  runStep(controller);
}

const id = core.getInput("id");
const name = core.getInput("name");
const if_ = core.getBooleanInput("if");
const env = YAML.parse(core.getInput("env"));
const timeoutMinutes = parseInt(core.getInput("timeout-minutes"));
const continueOnError = core.getBooleanInput("continue-on-error");
const shell = core.getInput("shell");
const run = core.getInput("run");

core.info("id:", id);
core.info("name:", name);

if (!if_) {
  core.info("Skipping");
  process.exit(0);
}

if (timeoutMinutes) {
  const timeoutId = setTimeout(process.exit, timeoutMinutes * 60 * 1000, 1);
  timeoutId.unref?.();
}

if (continueOnError) {
  process.on("exit", () => {
    core.info("Continuing on error");
    process.exitCode = 0;
  });
}

const safeEnv = {
  // ...filterUserEnv(process.env),
  ...env,
};
const envFile = temporaryWrite(envStringify(safeEnv));

const cmdPresets = {
  bash: "bash --noprofile --norc -eo pipefail {0}",
  python: "python {0}",
  sh: "sh -e {0}",
};
const cmdTpl = cmdPresets[shell] ?? shell;

await writeFile("/tmp/docker/run", run);
const cmd = cmdTpl.replace("{0}", "/tmp/docker/run");

await $`docker run \
  -i \
  --env-file ${envFile} \
  -v /tmp/docker:/tmp/docker \
  -v ${process.cwd()}:/runner/workspace \
  --platform=linux/arm64 \
  ghcr.io/runs-on/archlinux-latest \
  ${cmd.split(/\s+/)}`;
