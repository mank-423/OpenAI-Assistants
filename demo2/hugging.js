import { HfInference } from '@huggingface/inference'
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE)

hf.textClassification({
  model: 'fazni/distilbert-base-uncased-career-path-prediction',
  inputs: 'I know HTML, CSS, React, and MERN.'
})
.then(result => {
  console.log(result)
})