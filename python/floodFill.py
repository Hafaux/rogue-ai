import cv2
import numpy as np

def remove_background(img):
    tolerance = 32
    seed_pt = (0, 0)
    seed_color = img[seed_pt[1], seed_pt[0]]
    lower_val = np.array([seed_color[0] - tolerance, seed_color[1] - tolerance, seed_color[2] - tolerance, 0])
    upper_val = np.array([seed_color[0] + tolerance, seed_color[1] + tolerance, seed_color[2] + tolerance, 255])
    h, w = img.shape[:2]
    img_alpha = np.ones((h, w, 1), dtype=np.uint8) * 255
    img_with_alpha = np.concatenate((img, img_alpha), axis=-1)
    mask = cv2.inRange(img_with_alpha, lower_val, upper_val)
    removed_bg = cv2.bitwise_and(img_with_alpha, img_with_alpha, mask=cv2.bitwise_not(mask))
    return removed_bg

def resize_image(img, size):
    img_small = cv2.resize(img, (size, size), interpolation=cv2.INTER_LINEAR)
    return img_small
