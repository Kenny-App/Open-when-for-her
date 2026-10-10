document.addEventListener("DOMContentLoaded", () => {
  const gameSpace = document.getElementById("game-space");
  const heart = document.getElementById("heart");
  const heartSpace = document.getElementById("heart-space");
  const protectionCircle = document.getElementById("protection-circle");
  const gameover = document.getElementById("gameover");

  let gameStarted = false;
  let shieldActive = false;
  let spawnInterval = null;
  let minreachtime = 700; // Minimum time in milliseconds for projectiles to reach the heart.
  let minrandomtime = 350; // Minimum random additional time for projectiles to reach the heart.
  let reachtime = 2200; // Time in milliseconds for projectiles to reach the heart.
  let randomtime = 1000; // Random additional time for projectiles to reach the heart.

  let score = 0;

  const scoreElement = document.getElementById("score");
  const bestScoreElement = document.getElementById("best-score");

  let bestScore = Number(localStorage.getItem("heartBestScore")) || 0;
  bestScoreElement.textContent = bestScore;

  function returnToPreviousPage() {
    const previousPage = sessionStorage.getItem("previousPage");

    console.log("Online:", navigator.onLine);
    console.log("Previous page:", previousPage);

    if (navigator.onLine && previousPage) {
      // Remove the saved URL
      sessionStorage.removeItem("previousPage");

      console.log("Redirecting to:", previousPage);

      window.location.replace(previousPage);
    }
  }

  returnToPreviousPage();

  window.addEventListener("online", returnToPreviousPage);

  setInterval(returnToPreviousPage, 2000);

  // Change reachtime and randomtime every 20 seconds to increase difficulty.
  if (gameStarted) {
    setInterval(() => {
      [reachtime, randomtime] = ChangeReachTime(reachtime, randomtime);
      console.log(reachtime, randomtime);
    }, 20000);
  }

  // Update the score and best score.
  function updateScore() {
    score++;
    scoreElement.textContent = score;

    if (score > bestScore) {
      bestScore = score;
      bestScoreElement.textContent = bestScore;
      localStorage.setItem("heartBestScore", bestScore);
    }
  }
  // Function to change reachtime and randomtime, ensuring they don't go below the minimum values.
  function ChangeReachTime(newReachTime, newRandomTime) {
    if (newReachTime > minreachtime) {
      newReachTime -= 100;
    }
    if (newRandomTime > minrandomtime) {
      newRandomTime -= 50;
    }
    return [newReachTime, newRandomTime];
  }
  // Handle game over scenario.
  function gameOver() {
    gameStarted = false;

    clearInterval(spawnInterval);

    gameover.style.display = "block";

    // Stop and remove all projectiles immediately.
    const projectiles = gameSpace.querySelectorAll(".projectile");

    projectiles.forEach((projectile) => {
      projectile.getAnimations().forEach((animation) => {
        animation.onfinish = null;
        animation.oncancel = null;
        animation.cancel();
      });

      projectile.remove();
    });
  }
  // Create a projectile (rock or kiss) and animate it towards the heart.
  function createProjectile(type) {
    const projectile = document.createElement("span");

    projectile.className = `projectile ${type}`;
    projectile.textContent = type === "rock" ? "🪨" : "💋";

    const width = gameSpace.clientWidth;
    const height = gameSpace.clientHeight;

    const gameRect = gameSpace.getBoundingClientRect();
    const heartRect = heart.getBoundingClientRect();

    // Calculate the target position (center of the heart).
    const targetX = heartRect.left - gameRect.left + heartRect.width / 2 - 18;
    const targetY = heartRect.top - gameRect.top + heartRect.height / 2 - 18;

    // Spawn from a random direction outside the game area.
    const side = Math.floor(Math.random() * 4);

    let startX;
    let startY;
    // Determine the starting position based on the side.
    if (side === 0) {
      startX = Math.random() * width;
      startY = -40;
    } else if (side === 1) {
      startX = width + 40;
      startY = Math.random() * height;
    } else if (side === 2) {
      startX = Math.random() * width;
      startY = height + 40;
    } else {
      startX = -40;
      startY = Math.random() * height;
    }

    projectile.style.position = "absolute";
    projectile.style.left = "0";
    projectile.style.top = "0";
    projectile.style.transform = `translate(${startX}px, ${startY}px)`;

    gameSpace.appendChild(projectile);

    // Calculate the duration for the projectile to reach the heart.

    const duration = reachtime + Math.random() * randomtime;

    const animation = projectile.animate(
      [
        {
          transform: `translate(${startX}px, ${startY}px) rotate(0deg)`,
        },
        {
          transform: `translate(${targetX}px, ${targetY}px) rotate(360deg)`,
        },
      ],
      {
        duration,
        easing: "linear",
        fill: "forwards",
      },
    );

    // Check whether the projectile touches the shield.
    let collisionFrame;

    function checkCollision() {
      if (!projectile.isConnected) return;

      if (shieldActive && protectionCircle.classList.contains("active")) {
        const projectileRect = projectile.getBoundingClientRect();
        const shieldRect = protectionCircle.getBoundingClientRect();

        const projectileX = projectileRect.left + projectileRect.width / 2;
        const projectileY = projectileRect.top + projectileRect.height / 2;

        const shieldX = shieldRect.left + shieldRect.width / 2;
        const shieldY = shieldRect.top + shieldRect.height / 2;

        const distance = Math.hypot(
          projectileX - shieldX,
          projectileY - shieldY,
        );

        const shieldRadius = shieldRect.width / 2;
        const projectileRadius =
          Math.max(projectileRect.width, projectileRect.height) / 2;

        if (distance <= shieldRadius + projectileRadius) {
          animation.cancel();
          projectile.remove();
          return;
        }
      }

      collisionFrame = requestAnimationFrame(checkCollision);
    }

    collisionFrame = requestAnimationFrame(checkCollision);

    animation.onfinish = () => {
      cancelAnimationFrame(collisionFrame);

      if (projectile.isConnected) {
        if (type === "rock") {
          gameOver();
        } else {
          updateScore();
        }

        projectile.remove();
      }
    };

    animation.oncancel = () => {
      cancelAnimationFrame(collisionFrame);
    };
  }
  // Start the game when the user clicks on the game space.
  function startGame() {
    if (gameStarted) return;

    if (gameover.style.display === "block") {
      score = 0;
      scoreElement.textContent = score;
    }

    gameStarted = true;
    gameover.style.display = "none";

    createProjectile(Math.random() < 0.5 ? "rock" : "kiss");

    spawnInterval = setInterval(() => {
      createProjectile(Math.random() < 0.5 ? "rock" : "kiss");
    }, 1200);
  }
  // Add event listener to start the game on click.
  gameSpace.addEventListener("click", startGame);
});
