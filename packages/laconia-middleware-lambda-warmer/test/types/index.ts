import laconia from "@laconia/core";
import lambdaWarmer from "../../src/index";

const app = () => {};
const handler = laconia(app);
const warmer = lambdaWarmer();

exports.handler = warmer(warmer(handler));
