import { useEffect, useRef, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { LiaSaveSolid } from "react-icons/lia";
import { AiOutlineTeam } from "react-icons/ai";

export default function AdminPanel() {
  const [teams, setTeams] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);

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
    if (
      !pointRef.current ||
      teamId <= 0 ||
      roundId <= 0 ||
      Number(pointRef.current.value) === 0
    )
      return;

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
    if (points.length <= 0 || count === 0) return;

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

  async function updateTeams(teams: any[]) {
    if (teams.length <= 0) return;

    const body = { teams };
    const res = await fetch("/api/update_teams", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;

    const newTeams = await res.json();
    setTeams(newTeams);
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
    <div className="my-12">
      <h1 className="mb-10 text-center text-4xl font-semibold">Admin Panel</h1>

      <div>
        <div className="absolute left-6 top-4 flex items-center space-x-1">
          <img src="/logo.ico" className="mt-0.5 h-6 w-6" />
          <h3 className="text-xl font-semibold">IIE TECH CLUB</h3>
        </div>
        <TeamsToShow initTeams={teams} updateTeams={updateTeams} />
      </div>

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
            {teams.map(
              ({ id, name, hidden }: any) =>
                !hidden && (
                  <option key={`team_${id}`} value={id}>
                    {name}
                  </option>
                ),
            )}
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

      <div className="mx-12 mt-16 lg:mx-60">
        <h3 className="mb-4 text-lg font-medium">All QUIZ points</h3>

        <div className="relative max-h-52 overflow-y-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="sticky top-0 bg-white text-left shadow-sm">
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

type TeamsToShowProps = {
  initTeams: any[];
  updateTeams(teams: any[]): Promise<void>;
};

function TeamsToShow({ initTeams, updateTeams }: TeamsToShowProps) {
  const teamShowRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [teams, setTeams] = useState<any[]>([]);

  function onCheckChange(teamId: number, value: boolean) {
    const temp = [...teams];
    const idx = teams.findIndex((team) => team.id === teamId);
    temp[idx].hidden = !value;
    setTeams(temp);
  }

  function handleClickOutside(event: any) {
    if (teamShowRef.current && !teamShowRef.current!.contains(event.target)) {
      setIsDialogOpen(false);
    } else {
      /* clicked inside */
    }
  }

  useEffect(() => {
    setTeams(initTeams);
  }, [initTeams]);

  useEffect(() => {
    if (!teamShowRef.current) return;

    setTimeout(
      () => document.addEventListener("click", handleClickOutside),
      300,
    );

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="absolute right-12 top-6 select-none" ref={teamShowRef}>
      <div className="relative">
        <div
          className={`${isDialogOpen ? "block" : "hidden"} absolute -left-2 w-40 -translate-x-full rounded-lg border border-sky-50 bg-blue-50 px-2 py-1.5 shadow-md`}
        >
          {teams.map(({ id, name, hidden }: any) => (
            <div
              key={`team_${id}`}
              className="flex items-center justify-between space-x-2"
            >
              <label
                className="cursor-pointer text-sm text-slate-600"
                htmlFor={`show_team_${id}`}
              >
                {name}
              </label>
              <div className="inline-flex items-center">
                <label
                  className="relative flex cursor-pointer items-center"
                  id={`show_team_${id}`}
                >
                  <input
                    type="checkbox"
                    checked={!hidden}
                    onChange={(e) => onCheckChange(id, e.currentTarget.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow transition-all checked:border-blue-600 checked:bg-blue-600 hover:shadow-md"
                  />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-white opacity-0 peer-checked:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </label>
              </div>
            </div>
          ))}

          <div className="mt-2 flex w-full justify-end">
            <button
              onClick={() => updateTeams(teams)}
              className="rounded-md bg-green-200 px-1.5 py-0.5 text-sm text-green-700 transition-colors hover:bg-green-300"
            >
              save
            </button>
          </div>
        </div>
      </div>

      <button
        title="Teams to show"
        onClick={() => setIsDialogOpen((val) => !val)}
        className="rounded-lg bg-gray-100 px-3 py-1.5 text-blue-700 hover:bg-gray-200"
      >
        <AiOutlineTeam className="h-4 w-4" />
      </button>
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
            defaultValue={count}
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
