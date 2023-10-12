import EventEmitter from 'events';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import { Options } from 'express-jsdoc-swagger';
import express from 'express';
import { JsDocOptions } from './options/spec.options';

export default function generateOpenApiFromJsDoc(
  options: JsDocOptions,
  app?: express.Express
): Promise<string> {
  let expressApp = app;
  if (!expressApp) {
    expressApp = express();
  }
  return new Promise((resolve, reject) => {
    const expressSwaggerDoc = expressJSDocSwagger(expressApp!);
    const eventEmitter: EventEmitter = expressSwaggerDoc(options as Options);
    eventEmitter.on('finish', openapiSpec => {
      if (typeof openapiSpec === 'string') {
        resolve(openapiSpec);
      }
      reject('Invalid spec');
    });

    eventEmitter.on('error', error => {
      reject(error);
    });
  });
}
