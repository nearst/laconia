import laconia from "@laconia/core";
import serverlessPluginWarmup from "../../src/index";

const app = () => {};
const handler = laconia(app);
const warmup = serverlessPluginWarmup();

exports.handler = warmup(warmup(handler));
