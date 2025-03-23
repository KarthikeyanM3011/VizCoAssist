# Use official Python image
FROM python:3.9

# Set working directory
WORKDIR /app

# Copy only requirements first to leverage Docker caching
COPY ./app/requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY ./app /app

# Expose port
EXPOSE 8000

# Start the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
