import SceneManager from "./core/SceneManager";

const sceneManager = new SceneManager();

async function startGame() {
  await sceneManager.switchScene("StartMenu");
  await sceneManager.switchScene("Loading");
  const gameScene = await sceneManager.switchScene("Game");

  // Could refactor
  gameScene.on("OVER" as any, async () => {
    const gameOverScene = await sceneManager.switchScene("GameOver");

    gameOverScene.on("RESTART" as any, () => {
      startGame();
    });
  });
}

startGame();
