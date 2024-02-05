import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";
env.allowLocalModels = false;

const fileUpload = document.getElementById("file-upload");
const imageContainer = document.getElementById("image-container");
const status = document.getElementById("status");
const modelName = "Xenova/detr-resnet-50";

status.textContent = "Loading model...";

let detector;

(async () => {
    try {
        detector = await pipeline("object-detection", modelName);
        status.textContent = "Ready";
    } catch (error) {
        console.error("Error loading model:", error);
        status.textContent = "Error loading model";
    }
})();

fileUpload.addEventListener("change", handleFileUpload);

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    try {
        const imageUrl = await loadImage(file);
        imageContainer.innerHTML = "";
        const image = createImageElement(imageUrl);
        imageContainer.appendChild(image);
        await detect(image);
    } catch (error) {
        console.error("Error handling file upload:", error);
        status.textContent = "Error handling file upload";
    }
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

function createImageElement(src) {
    const image = document.createElement("img");
    image.src = src;
    return image;
}

async function detect(img) {
    try {
        status.textContent = "Analyzing...";
        const output = await detector(img.src, {
            threshold: 0.5,
            percentage: true,
        });
        status.textContent = "";
        output.forEach(renderBox);
    } catch (error) {
        console.error("Error detecting:", error);
        status.textContent = "Error detecting";
    }
}

function renderBox({ box, label }) {
    const { xmax, xmin, ymax, ymin } = box;
    const color = getRandomColor();

    const boxElement = createBoundingBoxElement(color, xmin, ymin, xmax, ymax);
    const labelElement = createLabelElement(label, color);

    boxElement.appendChild(labelElement);
    imageContainer.appendChild(boxElement);
}

function getRandomColor() {
    return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, 0);
}

function createBoundingBoxElement(color, xmin, ymin, xmax, ymax) {
    const boxElement = document.createElement("div");
    boxElement.className = "bounding-box";
    Object.assign(boxElement.style, {
        borderColor: color,
        left: 100 * xmin + "%",
        top: 100 * ymin + "%",
        width: 100 * (xmax - xmin) + "%",
        height: 100 * (ymax - ymin) + "%",
    });
    return boxElement;
}

function createLabelElement(label, color) {
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    labelElement.className = "bounding-box-label";
    labelElement.style.backgroundColor = color;
    return labelElement;
}
