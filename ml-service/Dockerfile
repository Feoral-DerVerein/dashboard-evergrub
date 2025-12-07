# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for Prophet and other libraries
# libgomp1 is needed for Prophet on Linux
# Install system dependencies required for Prophet and other libraries
# libgomp1 is needed for Prophet on Linux
# python3-dev and build-essential for compilation if needed
RUN apt-get update && apt-get install -y \
    libgomp1 \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Upgrade pip and install build tools to favor binary wheels or clean builds
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install any needed packages specified in requirements.txt
# Using --prefer-binary to try and avoid compilation if possible
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable with default
ENV PORT=10000

# Run main.py when the container launches
# Use sh -c to allow environment variable substitution
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
