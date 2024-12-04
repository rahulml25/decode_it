import { useEffect, useRef, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { LiaSaveSolid } from "react-icons/lia";

export default function AdminPanel() {
  const [teams, setTeams] = useState<any>([]);
  const [rounds, setRounds] = useState<any>([]);

  const [roundId, setRoundId] = useState<number>(0);
  const [teamId, setTeamId] = useState<number>(0);
  const [points, setPoints] = useState<any[]>([]);

  const pointRef = useRef<HTMLInputElement>(null);

  async function fetchTeamAndRounds() {
    const res = await fetch("/api/teams_n_rounds");
    if (!res.ok) return;

    const { teams, rounds } = await res.json();
    setTeams(teams), setRounds(rounds);
  }

  async function fetchPoints() {
    const res = await fetch(`/api/points`);
    if (!res.ok) return;

    const points = await res.json();
    setPoints(points);
  }

  async function addPoint() {
    if (!pointRef.current || teamId <= 0 || roundId <= 0) return;

    const body = { teamId, roundId, count: Number(pointRef.current.value) };
    const res = await fetch("/api/add_point", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;

    const points = await res.json();
    setPoints(points);
    pointRef.current.value = "";
  }

  async function deletePoint(pointId: number) {
    if (points.length <= 0) return;

    const body = { pointId };
    const res = await fetch("/api/delete_point", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;

    const newPoints = await res.json();
    setPoints(newPoints);
  }

  async function updatePoint(pointId: number, count: number) {
    if (points.length <= 0) return;

    const body = { pointId, count };
    const res = await fetch("/api/update_point", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;

    const newPoints = await res.json();
    setPoints(newPoints);
  }

  function onRoundChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setRoundId(Number(e.currentTarget.value));
  }

  function onTeamChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTeamId(Number(e.currentTarget.value));
  }

  useEffect(() => {
    fetchTeamAndRounds();
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [roundId, teamId]);

  return (
    <div className="mt-12">
      <h1 className="mb-10 text-center text-4xl font-semibold">Admin Panel</h1>

      <div className="mx-auto flex w-fit items-center space-x-4">
        <div className="w-72">
          <label htmlFor="round" className="text-lg font-medium text-gray-900">
            Round
          </label>

          <select
            name="round"
            id="round"
            onChange={onRoundChange}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 outline-blue-600"
          >
            <option value="0">Please select</option>
            {rounds.map(({ name, id }: any) => (
              <option key={`round_${id}`} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-72">
          <label htmlFor="team" className="text-lg font-medium text-gray-900">
            Team
          </label>

          <select
            name="team"
            id="team"
            onChange={onTeamChange}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 outline-blue-600"
          >
            <option value="0">Please select</option>
            {teams.map(({ name, id }: any) => (
              <option key={`team_${id}`} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!!(roundId && teamId) && (
        <div className="mx-auto mt-5 w-fit">
          <label htmlFor="point" className="font-medium text-gray-900">
            Point
          </label>

          <div className="inline-flex w-full space-x-2">
            <input
              id="point"
              type="number"
              ref={pointRef}
              className="rounded-lg border border-gray-300 px-2 py-1 outline-blue-600"
            />
            <button
              onClick={addPoint}
              className="inline-block rounded-lg border bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:relative"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="mx-12 mt-16 max-h-96 lg:mx-60">
        <h3 className="mb-4 text-lg font-medium">All QUIZ points</h3>

        <div className="overflow-y-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="text-left">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  SNo.
                </th>

                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Round
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Team
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Point
                </th>

                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {points.map(
                ({ id, count, score: { round, team } }: any, idx: number) => (
                  <PointRow
                    key={`point_${id}`}
                    sno={idx + 1}
                    count={count}
                    team={team.name}
                    round={round.name}
                    deletePoint={() => deletePoint(id)}
                    updatePoint={(count) => updatePoint(id, count)}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type PointRowProps = {
  sno: number;
  count: number;
  round: string;
  team: string;
  deletePoint(): Promise<void>;
  updatePoint(count: number): Promise<void>;
};

const PointRow = ({
  sno,
  count,
  round,
  team,
  deletePoint,
  updatePoint,
}: PointRowProps) => {
  const [editing, setEditing] = useState(false);
  const pointRef = useRef<HTMLInputElement>(null);

  function onEdit() {
    setEditing(true);
  }

  async function onUpdate() {
    if (!pointRef.current) return;

    await updatePoint(Number(pointRef.current.value));
    setEditing(false);
  }

  return (
    <tr>
      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
        {sno}
      </td>

      <td className="whitespace-nowrap px-4 py-2 text-gray-700">{round}</td>
      <td className="whitespace-nowrap px-4 py-2 text-gray-700">{team}</td>
      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
        {editing ? (
          <input
            type="number"
            ref={pointRef}
            className="w-16 rounded-lg border border-gray-300 px-1.5 py-0.5 outline-blue-600"
            value={count}
          />
        ) : (
          count
        )}
      </td>

      <td className="space-x-1 whitespace-nowrap px-4 py-2 text-gray-700">
        {editing ? (
          <button
            title="save"
            onClick={onUpdate}
            className="rounded-md bg-gray-100 px-2 py-1 text-green-700 hover:bg-gray-200"
          >
            <LiaSaveSolid className="h-4 w-4" />
          </button>
        ) : (
          <button
            title="edit"
            onClick={onEdit}
            className="rounded-md bg-gray-100 px-2 py-1 text-blue-500 hover:bg-gray-200"
          >
            <CiEdit className="h-4 w-4" />
          </button>
        )}
        <button
          title="delete"
          onClick={deletePoint}
          className="rounded-md bg-gray-100 px-2 py-1 text-red-500 hover:bg-gray-200"
        >
          <MdOutlineDelete className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};
