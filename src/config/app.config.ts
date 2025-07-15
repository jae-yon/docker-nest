import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  port: parseInt(process.env.PORT ?? '5000'),
  host: process.env.HOST ?? 'localhost',
}));