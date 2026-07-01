export function Feedback({ erro, sucesso }: { erro: string; sucesso: string }) {
  return (
    <>
      {erro && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      {sucesso && (
        <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {sucesso}
        </p>
      )}
    </>
  );
}
