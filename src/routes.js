import { Router } from "express";

import DecryptController from "./controller/DecryptController";

const routes = new Router();

routes.post("/decrypt", DecryptController.store);

export default routes;
