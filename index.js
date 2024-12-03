const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const CONFIDENCE_THRESHOLD = 0.3;

// https://storage.googleapis.com/movenet/coco-keypoints-500.png
const LINES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [5, 6],
  [5, 7],
  [6, 8],
  [7, 9],
  [8, 10],
  [11, 12],
  [11, 13],
  [12, 14],
  [13, 15],
  [14, 16],
]

// Load the pose detection model
async function loadModel() {
  const model = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
  return model;
}

// Start the webcam video
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

// Draw keypoint on the canvas
function drawKeypoint(keypoint) {
  const { x, y } = keypoint;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = 'red';
  ctx.fill();
}

function isConfident(point) {
  return point.score > CONFIDENCE_THRESHOLD;
}

// Draw keypoints on the canvas
function drawKeypoints(keypoints) {
  keypoints.forEach(point => {
    if (isConfident(point)) {
      drawKeypoint(point);
    }
  });
}

// Draw line on the canvas from point1 to point2
function drawLine(point1, point2) {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'blue'; // Set line color
  ctx.lineWidth = 2; // Set line width
  ctx.stroke();
}

// Perform pose detection
async function detectPose(model) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const poses = await model.estimatePoses(video);

  poses.forEach(pose => {
    drawKeypoints(pose.keypoints);
    for (const line of LINES) {
      const firstPoint = pose.keypoints[line[0]];
      const secondPoint = pose.keypoints[line[1]];
      if (isConfident(firstPoint) && isConfident(secondPoint)) {
        drawLine(firstPoint, secondPoint);
      }
    }
  });

  requestAnimationFrame(() => detectPose(model)); // Loop for continuous detection
}

// Initialize everything
async function init() {
  await setupCamera();
  const model = await loadModel();
  detectPose(model);
}

init();