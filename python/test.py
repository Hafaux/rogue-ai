from fastapi import FastAPI

app = FastAPI()

@app.post("/")
async def process_data(input_data: dict):
    print(input_data)
    output_data = {"result": f"Processed {input_data}"}
    return output_data

