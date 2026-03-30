# Raspberry Pi 5 Model Runner

This folder is isolated from the existing backend/frontend setup.
It provides a standalone script to run model inference on Raspberry Pi 5.

## 1) Create and activate a virtual environment on Pi 5

```bash
cd anti-counterfeit-scanner/raspberry_pi5
python3 -m venv .venv
source .venv/bin/activate
```

## 2) Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements-pi5.txt
```

Note: For Raspberry Pi OS, install `torch`/`torchvision` wheels compatible with your Python version.

## 3) Run inference

From inside `raspberry_pi5/`:

```bash
python run_model_pi5.py --image ../dataset/val/genuine/1.jpg
```

Optional flags:

```bash
python run_model_pi5.py \
  --image ../dataset/val/counterfeit/1.jpg \
  --model ../models/best_model.pth \
  --repeat 5 \
  --output result.json
```

## What this script does

- Loads `ProductAuthenticator` from the existing model code.
- Forces CPU inference (suitable for Raspberry Pi 5).
- Prints JSON prediction output and average latency.
- Does not modify or interfere with current backend/frontend files.
