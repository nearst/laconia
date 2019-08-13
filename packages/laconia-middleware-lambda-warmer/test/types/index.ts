import laconia from "@laconia/core";
import lambdaWarmer from "../../src/index";

const app = () => {};
const handler = laconia(app);

exports.handler = lambdaWarmer(lambdaWarmer(handler));
