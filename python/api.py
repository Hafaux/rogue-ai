import torch
from diffusers import StableDiffusionPipeline, EulerDiscreteScheduler, DDIMScheduler
import uuid
import datetime
from floodFill import remove_background, resize_image
import numpy as np

model_id = "stabilityai/stable-diffusion-2-1"

pipe = StableDiffusionPipeline.from_pretrained(
    model_id,
    scheduler=EulerDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler"),
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

from fastapi import FastAPI

app = FastAPI()

@app.post("/")
async def process_data(input_data: dict):
    print("model request:", input_data)

    generated = pipe(
      prompt=input_data.get("prompt", "Astronaut riding a horse"),
      negative_prompt=input_data.get("negative_prompt"),
      num_images_per_prompt=input_data.get("num_images", 1),
      # generator=generator,
      num_inference_steps=input_data.get("num_steps", 50)
    )

    names = []
    for img in generated.images:
        date = datetime.datetime.now().strftime("%d-%H:%M:%S.%f")
        id = uuid.uuid4()
        name = f'{date}-{id}'
        img.save(f"/home/martin/images/{name}-orig.png")
        img = remove_background(np.array(img))
        img.save(f"/home/martin/images/{name}-removed-bg.png")
        img = resize_image(np.array(img), 32)
        img.save(f"/home/martin/images/{name}.png")
        names.append(name)

    return { "filenames": names }


