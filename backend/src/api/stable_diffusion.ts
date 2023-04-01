import axios from "axios";
import fs from "fs";
import http from "http";

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

  async saveImage(data: StableRequest, path: string) {
    const response = await this.request(data);

    const url = process.env.IMAGES_URL + response.filenames[0] + ".png";

    const file = fs.createWriteStream(path);

    await new Promise((res) => {
      http.get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          res(null);
        });
      });
    });
  }

  async request(data: StableRequest) {
    const response = (await axios.post(this.url, data, this.config))
      .data as StableResponse;

    return response;
  }
}
