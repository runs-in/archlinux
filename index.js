#!/usr/bin/env node
import { DockerDefaultController } from "@runs-on/controller";
import execWorkflow from "@metactions/exec-workflow";
import execStep from "@metactions/exec-step";

const runsOn = core.getInput("runs-on", { required: true });

await $`docker run \
  --rm \
  --name ${runsOn} \
  --platform=linux/amd64 \
  -dit \
  ghcr.io/runs-on/${runsOn} \
  /bin/sh`;

const controller = {
  spawn(cmd, args = [], options = {}) {
    const { cwd, env = {}, detached } = options;
    const envFile = temporaryWriteSync(envStringify(env));
    return $`docker exec \
      --env-file ${envFile} \
      ${cwd ? ["-w", cwd] : []} \
      ${detached ? ["-d"] : []} \
      ${runsOn} \
      ${[cmd].concat(args)}`;
  },
};

if (process.env.WORKFLOW) {
  execWorkflow(controller);
} else {
  execStep(controller);
}
