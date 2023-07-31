#!/usr/bin/env node
import { DockerDefaultController } from "@runs-on/controller";
import execWorkflow from "@runs-on/exec-workflow";
import execStep from "@runs-on/exec-step";

const controller = new DockerDefaultController("archlinux-*");
if (process.env.WORKFLOW) {
  await execWorkflow(controller);
} else {
  await execStep(controller);
}
