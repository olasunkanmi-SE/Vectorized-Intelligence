import * as express from "express";
import { IDomainModel } from "../repositories/model";
import { Result } from "../lib/result";
import { DomainHandler } from "../handlers/domain.handler";
import { domainRequestSchema } from "../lib/validation-schemas";
import { ZodError } from "zod";
import { generatorValidationError } from "../utils/utils";
export class DomainController {
  path = "/domain";
  router = express.Router();
  constructor() {
    this.initRoutes();
  }

  initRoutes() {
    this.router.post(`${this.path}/create`, this.createDomain);
  }

  async createDomain(req: express.Request, res: any, next: express.NextFunction): Promise<Result<IDomainModel>> {
    try {
      const { name } = domainRequestSchema.parse(req.body);
      const domainHandler = new DomainHandler();
      const response = await domainHandler.handle({ name });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues.map((issue) => generatorValidationError(issue)).join(" ");
        return res.status(400).json(Result.fail(errorMessage, 400));
      }
      console.error("An unexpected error occurred:", error);
      next(error);
    }
  }
}