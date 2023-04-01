import torch
from diffusers import StableDiffusionPipeline, EulerDiscreteScheduler, DDIMScheduler
import uuid
import datetime
from floodFill import remove_background, resize_image
import numpy as np
import cv2

model_id = "stabilityai/stable-diffusion-2-1-base"

original_conv2d_init = None
def patch_conv(cls, use_circular_padding):
    global original_conv2d_init

    if original_conv2d_init is None:
        original_conv2d_init = cls.__init__

    def new_init(self, *args, **kwargs):
        return original_conv2d_init(self, *args, **kwargs, padding_mode='circular')

    if use_circular_padding:
        cls.__init__ = new_init
    else:
        cls.__init__ = original_conv2d_init

def create_pipeline(use_circular_padding):
    patch_conv(torch.nn.Conv2d, use_circular_padding)
    # Use the Euler scheduler here instead
    scheduler = EulerDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    # scheduler = DDIMScheduler.from_pretrained(model_id, subfolder="scheduler")
    pipe = StableDiffusionPipeline.from_pretrained(model_id, scheduler=scheduler, torch_dtype=torch.float16)
    pipe = pipe.to("cuda")
    return pipe

pipe_normal = create_pipeline(False)
pipe_tiling = create_pipeline(True)

from fastapi import FastAPI

app = FastAPI()

@app.post("/")
async def process_data(input_data: dict):
    print("model request:", input_data)

    pipe = pipe_tiling if input_data.get("tiling", False) else pipe_normal

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
        img = np.array(img)
        if input_data.get("remove_background", True):
            cv2.imwrite(f"/home/martin/images/{name}-orig.png", img)
            img = remove_background(np.array(img))

        cv2.imwrite(f"/home/martin/images/{name}-removed-bg.png", img)
        img = resize_image(np.array(img), 32)
        cv2.imwrite(f"/home/martin/images/{name}.png", img)
        names.append(name)

    return { "filenames": names }