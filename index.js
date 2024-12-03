const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const CONFIDENCE_THRESHOLD = 0.3;

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

// Draw keypoints on the canvas
function drawKeypoints(keypoints) {
  keypoints.forEach(point => {
    if (point.score > CONFIDENCE_THRESHOLD) {
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
    drawLine(pose.keypoints[3], pose.keypoints[4]);
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