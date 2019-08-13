import laconia from "@laconia/core";
import warmup from "../../src/index";

const app = () => {};
const handler = laconia(app);

exports.handler = warmup(warmup(handler));
