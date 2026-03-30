"""
Raspberry Pi 5 standalone inference runner.
This script is isolated in its own folder and does not modify existing app/backend code.
"""

import argparse
import json
import os
import sys
import time


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run counterfeit model inference on Raspberry Pi 5")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument(
        "--model",
        default=os.path.join("..", "models", "best_model.pth"),
        help="Path to model weights (.pth)",
    )
    parser.add_argument(
        "--device",
        default="cpu",
        choices=["cpu"],
        help="Inference device. Use CPU on Raspberry Pi.",
    )
    parser.add_argument(
        "--repeat",
        type=int,
        default=1,
        help="Run inference N times and report average latency.",
    )
    parser.add_argument(
        "--output",
        default="",
        help="Optional JSON output file path.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    image_path = os.path.abspath(args.image)
    model_path = os.path.abspath(os.path.join(script_dir, args.model)) if not os.path.isabs(args.model) else args.model

    if not os.path.exists(image_path):
        print(f"ERROR: image not found: {image_path}")
        return 1

    if not os.path.exists(model_path):
        print(f"ERROR: model not found: {model_path}")
        return 1

    try:
        from models.predict import ProductAuthenticator
    except Exception as exc:
        print("ERROR: failed to import ProductAuthenticator from models.predict")
        print(f"Details: {exc}")
        return 1

    print("Loading model...")
    authenticator = ProductAuthenticator(model_path=model_path, device=args.device)

    runs = max(1, args.repeat)
    latencies_ms = []
    result = None

    for _ in range(runs):
        start = time.perf_counter()
        result = authenticator.predict(image_path)
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        latencies_ms.append(elapsed_ms)

    if not result:
        print("ERROR: prediction failed")
        return 1

    avg_latency = sum(latencies_ms) / len(latencies_ms)
    payload = {
        "image": image_path,
        "model": model_path,
        "device": args.device,
        "runs": runs,
        "avg_latency_ms": round(avg_latency, 3),
        "result": result,
    }

    print(json.dumps(payload, indent=2))

    if args.output:
        output_path = os.path.abspath(args.output)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"Saved JSON output to: {output_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
