import axios from "axios";

export type StableRequest = {
  prompt: string;
  negative_prompt?: string;
  num_inference_steps?: number;
  num_images_per_prompt?: number;
};

export type StableResponse = {
  filenames: string[];
};

export default class StableDiffusion {
  url: string;
  config: { headers: { "Content-Type": string } };
  constructor() {
    this.url = process.env.STABLE_DIFF_URL as string;
    this.config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  async request(data: StableRequest) {
    const response = (await axios.post(
      this.url,
      data,
      this.config
    )) as StableResponse;

    return response;
  }
}
