// swagger.js
import swaggerAutogen from "swagger-autogen";

const generator = swaggerAutogen({ openapi: "3.0.0" });

const doc = {
  openapi: "3.0.0", // ←만 남기고
  info: {
    title: "PetSNS API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:3000/api" }],
  // paths, components 등은 자동 생성됩니다
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js", "./routes/*.js"];

generator(outputFile, endpointsFiles, doc).then(() => {
  console.log("✅ swagger-output.json 생성 완료 (OpenAPI 3.0)");
});
