import torch
from diffusers import StableDiffusionPipeline, EulerDiscreteScheduler, DDIMScheduler
import uuid

with torch.no_grad():
    model_id = "stabilityai/stable-diffusion-2-1"

    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        scheduler=EulerDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler"),
        torch_dtype=torch.float16
    )
    pipe = pipe.to("cuda")

    from fastapi import FastAPI

    app = FastAPI()

    input_data = {}

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
        img.save(f"/home/martin/images/{name}")
        names.append(name)

