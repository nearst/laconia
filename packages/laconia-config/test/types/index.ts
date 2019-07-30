import laconia from "@laconia/core";
import config from "../../src/index";

const app = async (input: number, { someSecret }: { someSecret: string }) => {};

exports.handler = laconia(app).register(config.envVarInstaces());
