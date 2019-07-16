import laconia from "@laconia/core";
import adapter from "../../src/index";

interface MyS3Object {}

const s3 = adapter.s3();
const app = async (object: MyS3Object) => {
  console.log(object);
};

laconia(s3(app));

adapter.s3({ inputType: "stream" });
adapter.s3({ inputType: "object" });
