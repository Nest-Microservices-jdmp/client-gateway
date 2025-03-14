import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  PRODUCTS_MICROSERVICES_HOST: string;
  PRODUCTS_MICROSERVICES_PORT: number;
  ORDERS_MICROSERVICES_HOST: string;
  ORDERS_MICROSERVICES_PORT: number;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    PRODUCTS_MICROSERVICES_HOST: joi.string().required(),
    PRODUCTS_MICROSERVICES_PORT: joi.number().required(),
    ORDERS_MICROSERVICES_HOST: joi.string().required(),
    ORDERS_MICROSERVICES_PORT: joi.number().required(),
  })
  .unknown(true);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error : ${error.message}`);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  PRODUCTS_MICROSERVICES_HOST: envVars.PRODUCTS_MICROSERVICES_HOST,
  PRODUCTS_MICROSERVICES_PORT: envVars.PRODUCTS_MICROSERVICES_PORT,
  ORDERS_MICROSERVICES_HOST: envVars.ORDERS_MICROSERVICES_HOST,
  ORDERS_MICROSERVICES_PORT: envVars.ORDERS_MICROSERVICES_PORT,
};
