import { config } from "dotenv";
import { Document, model, Schema } from "mongoose";
config();

export interface Type extends Document {
  normalid: string,
  googleid: string,
  password: string,
  name: string,
  picture: string
};

const Schemadata: Schema = new Schema({
  normalid: { type: String },
  googleid: { type: String },
  password: { type: String },
  name: { type: String },
  picture: { type: String }
});

export const Model = model<Type>('User', Schemadata);