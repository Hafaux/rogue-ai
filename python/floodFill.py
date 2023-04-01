import cv2
import numpy as np

# Load the image
img = cv2.imread("image.png")

connectivity = 4

tolerance = 32
_tolerance = (tolerance, tolerance, tolerance, )

_flood_fill_flags = (
    connectivity | cv2.FLOODFILL_FIXED_RANGE | 255 << 8
)

h, w = img.shape[:2]

# Perform flood fill on the grayscale image
mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
# mask = np.zeros_like(img, dtype=np.uint8)
seed_pt = (5, 5)  # Seed point for the flood fill operation
new_val = (0, 0, 255, 0)  # New color value for the flooded area
num_filled = cv2.floodFill(img, None, seed_pt, new_val, _tolerance, _tolerance, _flood_fill_flags)
# num_filled = cv2.floodFill(mask, None, seed_pt, new_val)

result = cv2.bitwise_and(img, img, mask)

# Display the original image and the filled image
cv2.imshow("Original Image", result)
cv2.waitKey(0)


