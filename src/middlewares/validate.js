import chalk from "chalk";
import Joi from "joi";
import mongoose from "mongoose";

const productSchema = Joi.object({
    name: Joi.string().min(3).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().optional(),
    category: Joi.string().optional(),
      stock: Joi.number().min(0).optional()
});

const updateProductSchema = Joi.object({
        name: Joi.string().min(3).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().optional(),
    category: Joi.string().optional(),
}).min(1); // có ít nhất 1 trường

// middle xác thực tạo

const validateProduct = (req, res, next) =>{
    const {error} = productSchema.validate(req.body);
    if(error){
        console.log(chalk.red(`Validate error: ${error.details[0].message}`));
        return res.status(400).send({ error: error.details[0].message});
    }
    next();
};

// middle xác thực cập nhật

const validateUpdateProduct = (req, res, next) => {
  console.log("Validating update product:", req.body);
  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    console.log(chalk.red(`Validate error: ${error.details[0].message}`));
    return res.status(400).send({ error: error.details[0].message });
  }
  console.log("Update product validation passed");
  next();
};

const validateId = (req, res, next) => {
  console.log("Validating ID:", req.params.id);
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log(chalk.red(`Invalid ID: ${req.params.id}`));
    return res.status(400).send({ error: "Invalid ID" });
  }
  console.log("ID validation passed");
  next();
}

// Hàm xác thực cho cli
const validateProductCLI = (data)=>{
    const {error} = productSchema.validate(data);
    if(error){
        console.log(chalk.red(`CLI Validate error: ${error.details[0].message}`));
        return false;
    }
    return true;
};

// Hàm xác thực cập nhật cho CLI
const validateUpdateProductCLI = (data)=>{
    const {error} = updateProductSchema.validate(data);
    if(error){
        console.log(chalk.red(`CLI Validate error: ${error.details[0].message}`));
        return false;
    }
    return true;
};
export  {validateProduct, validateUpdateProduct, validateProductCLI, validateId ,validateUpdateProductCLI};