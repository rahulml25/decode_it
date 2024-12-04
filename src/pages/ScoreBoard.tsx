import { useEffect, useState } from "react";
import { io as socketIO } from "socket.io-client";

import { GoScreenFull } from "react-icons/go";

const socket = socketIO();

export default function ScoreBoard() {
  const [_, setIsFullscreen] = useState(false);
  const [data, setData] = useState<any>(null);

  function toggleFullscreen() {
    setIsFullscreen((isFullscreen) => {
      if (isFullscreen === true) {
        document.exitFullscreen();
        return false;
      } else {
        document.documentElement.requestFullscreen();
        return true;
      }
    });
  }

  async function fetchData() {
    const res = await fetch("/api/scores");
    if (!res.ok) return;

    const data = await res.json();
    setData(data);

    socket.on("score_update", (score_update) => {
      const temp = { ...data };
      temp.teams[score_update.teamId - 1].scores[score_update.roundId - 1] =
        score_update.points;
      setData(temp);
    });
  }

  useEffect(() => {
    fetchData();

    // socket.on("hide_team", console.log);
  }, []);

  return (
    <div className="bg-inherit px-12 lg:px-60">
      <header className="my-14 text-center">
        <h3 className="absolute left-6 top-4 text-xl font-semibold">
          IIE TECH CLUB
        </h3>
        <button
          className="absolute right-6 top-4 text-xl font-semibold"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          <GoScreenFull />
        </button>

        <h1 className="text-4xl font-bold">DECODE IT</h1>
        <span className="font-semibold text-yellow-500">Let's decode it!</span>
      </header>

      <main className="my-14">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="text-left">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Teams
                </th>

                {data?.rounds.map((name: string, idx: number) => (
                  <th
                    key={`head_${idx}`}
                    className="whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                  >
                    {name}
                  </th>
                ))}

                {/* <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Round 2
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Round 3
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Round 4
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Round 5
                </th> */}
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {data?.teams.map(
                (
                  { name, scores }: { name: string; scores: number[] },
                  idx: number,
                ) => (
                  <tr key={`team_${idx}`}>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {name}
                    </td>

                    {scores?.map((score: number, idx: number) => (
                      <td
                        className="whitespace-nowrap px-4 py-2 text-gray-700"
                        key={`round_${idx}`}
                      >
                        {score}
                      </td>
                    ))}

                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {scores?.reduce((a: number, b: number) => a + b, 0)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
