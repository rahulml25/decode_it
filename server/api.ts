import express from "express";
import prisma from "../prisma";
import { socketIO } from ".";

const router = express.Router();

function getPoints() {
  return prisma.point.findMany({
    orderBy: { id: "desc" },
    select: {
      id: true,
      count: true,
      score: {
        select: {
          round: { select: { name: true } },
          team: { select: { name: true } },
        },
      },
    },
  });
}

router.get("/scores", async (_, res) => {
  const rounds = (await prisma.round.findMany({ select: { name: true } })).map(
    ({ name }) => name,
  );

  const teams = (
    await prisma.team.findMany({
      include: {
        scores: {
          select: { points: { select: { count: true } }, roundId: true },
        },
      },
      where: { hidden: false },
    })
  ).map(({ name, scores }) => {
    const formattedScores = new Array<number>(rounds.length).fill(0);

    for (const score of scores) {
      formattedScores[score.roundId - 1] = score.points.reduce(
        (a, b) => a + b.count,
        0,
      );
    }

    return {
      name,
      scores: formattedScores,
    };
  });

  const data = { rounds, teams };
  res.json(data);
});

router.get("/teams_n_rounds", async (_, res) => {
  const rounds = await prisma.round.findMany({
    select: { id: true, name: true },
  });

  const teams = await prisma.team.findMany({
    select: { id: true, name: true, hidden: true },
  });

  const data = { rounds, teams };
  res.json(data);
});

router.get("/points", async (req, res) => {
  const points = await getPoints();
  res.json(points);
});

router.post("/add_point", async (req, res) => {
  const { roundId, teamId, count } = req.body;

  let score = await prisma.score.findFirst({
    where: { roundId, teamId },
    select: { id: true },
  });

  if (score === null) {
    score = await prisma.score.create({
      data: { roundId, teamId },
      select: { id: true },
    });
  }

  await prisma.point.create({ data: { count, scoreId: score.id } });

  let points: any = (await prisma.point.findMany({
    where: { scoreId: score.id },
    select: { count: true },
  }))!.reduce((a, b) => a + b.count, 0);

  socketIO.emit("score_update", { roundId, teamId, points });

  points = await getPoints();
  res.json(points);
});

router.put("/update_point", async (req, res) => {
  const { pointId, count } = req.body;

  const {
    score: { id: scoreId, roundId, teamId },
  } = await prisma.point.update({
    where: { id: pointId },
    data: { count },
    select: { score: { select: { id: true, roundId: true, teamId: true } } },
  });

  let points: any = (await prisma.point.findMany({
    where: { scoreId },
    select: { count: true },
  }))!.reduce((a, b) => a + b.count, 0);

  socketIO.emit("score_update", { roundId, teamId, points });

  points = await getPoints();
  res.json(points);
});

router.delete("/delete_point", async (req, res) => {
  const { pointId } = req.body;

  const {
    score: { id: scoreId, roundId, teamId },
  } = await prisma.point.delete({
    where: { id: pointId },
    select: { score: { select: { id: true, roundId: true, teamId: true } } },
  });

  let points: any = (await prisma.point.findMany({
    where: { scoreId: scoreId },
    select: { count: true },
  }))!.reduce((a, b) => a + b.count, 0);

  socketIO.emit("score_update", { roundId, teamId, points });

  points = await getPoints();
  res.json(points);
});

export default router;
