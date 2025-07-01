// middleware/index.js
export { default as authenticate } from "./authenticate.js";
export { default as authorize } from "./authorize.js";
export {default as sessionAuth} from "./sessionAuth.js";
export { validateProduct, validateUpdateProduct, validateId } from "./validate.js";
export { default as logger } from "./logger.js";