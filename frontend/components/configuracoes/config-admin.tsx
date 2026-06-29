"use client";

import { Building2, ImagePlus, Save, Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "@/services/api";
import {
  ACADEMIA_LOGO_ACCEPT,
  atualizarAcademia,
  buscarAcademia,
  uploadAcademiaLogoFile,
  validateAcademiaLogoFile,
  type AcademiaDetalhes,
  type DuracaoReserva,
} from "@/services/academia.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getUsuario,
  updateStoredUsuario,
  type AcademiaUsuarioLogado,
  type UsuarioLogado,
} from "@/lib/auth-storage";
import {
  AVATAR_ACCEPT,
  removeAvatarFile,
  uploadAvatarFile,
  validateAvatarFile,
} from "@/lib/avatar-upload";
import { buscarUltimaAcademia, salvarUltimaAcademia } from "@/lib/last-academia";
import { maskCep, maskPhone, onlyNumbers } from "@/lib/masks";
import { getSafeImageUrl } from "@/lib/safe-image";
import { getAdminAcademias } from "@/lib/user-role";

type AbaConfig = "perfil" | "academia";

const DURACOES_RESERVA: DuracaoReserva[] = [60, 90, 120];

type AdminContext = {
  usuario: UsuarioLogado;
  vinculo: AcademiaUsuarioLogado;
  academiaId: string;
  isDono: boolean;
};

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T; user?: T };
  return data.data ?? data.user ?? (response.data as T);
}

function getAcademiaId(vinculo?: AcademiaUsuarioLogado) {
  return vinculo?.academia_id ?? vinculo?.academia?.id ?? "";
}

function getAdminContext(): AdminContext | null {
  const usuario = getUsuario();
  const vinculos = getAdminAcademias(usuario);

  if (!usuario || vinculos.length === 0) return null;

  const ultimaAcademiaId = buscarUltimaAcademia();
  const vinculo =
    vinculos.find((item) => getAcademiaId(item) === ultimaAcademiaId) ??
    vinculos[0];
  const academiaId = getAcademiaId(vinculo);

  if (!academiaId) return null;

  salvarUltimaAcademia(academiaId);

  return {
    usuario,
    vinculo,
    academiaId,
    isDono: vinculo.perfil === "DONO",
  };
}

function getInitials(nome?: string) {
  if (!nome) return "IQ";

  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function maskCnpj(value: string) {
  const numbers = onlyNumbers(value).slice(0, 14);

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  }
  if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8)}`;
  }

  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
    5,
    8
  )}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
}

function clearAcademiasCache() {
  try {
    window.localStorage.removeItem("playfy_academias_cache:v2");
  } catch {}
}

function mergeAcademiaNoUsuario(academia: AcademiaDetalhes) {
  const usuario = getUsuario();

  if (!usuario?.academias) return;

  updateStoredUsuario({
    ...usuario,
    academias: usuario.academias.map((vinculo) => {
      if (getAcademiaId(vinculo) !== academia.id) return vinculo;

      return {
        ...vinculo,
        academia: {
          ...vinculo.academia,
          id: academia.id,
          nome: academia.nome,
          slug: academia.slug,
          cidade: academia.cidade,
          estado: academia.estado,
          status: academia.status,
        },
      };
    }),
  });
}

export function ConfigAdmin() {
  const [aba, setAba] = useState<AbaConfig>("perfil");
  const [context, setContext] = useState<AdminContext | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setContext(getAdminContext());
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!context) {
    return (
      <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
        Nao foi possivel carregar a academia vinculada.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 flex gap-2 overflow-x-auto">
        <ConfigTab active={aba === "perfil"} onClick={() => setAba("perfil")}>
          <UserRound className="h-4 w-4" />
          Editar perfil
        </ConfigTab>

        <ConfigTab
          active={aba === "academia"}
          onClick={() => setAba("academia")}
        >
          <Building2 className="h-4 w-4" />
          Editar academia
        </ConfigTab>
      </div>

      {aba === "perfil" ? (
        <ConfigPerfil usuario={context.usuario} />
      ) : (
        <ConfigAcademia
          academiaId={context.academiaId}
          isDono={context.isDono}
        />
      )}
    </div>
  );
}

function ConfigTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition",
        active
          ? "bg-zinc-950 text-white"
          : "bg-white text-zinc-600 hover:bg-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ConfigPerfil({ usuario }: { usuario: UsuarioLogado }) {
  const [form, setForm] = useState({
    nome: usuario.nome ?? "",
    email: usuario.email ?? "",
    telefone: usuario.telefone ?? "",
    foto_perfil: usuario.foto_perfil ?? "",
    fotoUrl: usuario.fotoUrl ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : ""),
    [avatarFile]
  );
  const fotoSegura =
    avatarPreview || getSafeImageUrl(form.foto_perfil || form.fotoUrl);

  useEffect(() => {
    if (!avatarPreview) return;

    return () => {
      URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAvatarFile(null);
      return;
    }

    const error = validateAvatarFile(file);

    if (error) {
      setErro(error);
      event.target.value = "";
      setAvatarFile(null);
      return;
    }

    setErro("");
    setSucesso("");
    setAvatarFile(file);
  }

  async function salvarPerfil() {
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      const response = await api.put("/users/me", {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: onlyNumbers(form.telefone),
      });

      let usuarioAtualizado = getData<UsuarioLogado>(response);

      if (avatarFile) {
        usuarioAtualizado = await uploadAvatarFile<UsuarioLogado>(avatarFile);
      }

      updateStoredUsuario(usuarioAtualizado);
      setAvatarFile(null);
      setForm((current) => ({
        ...current,
        foto_perfil: usuarioAtualizado.foto_perfil ?? "",
        fotoUrl: usuarioAtualizado.fotoUrl ?? "",
      }));
      setSucesso("Perfil atualizado com sucesso.");
    } catch {
      setErro("Nao foi possivel atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function removerFoto() {
    setErro("");
    setSucesso("");
    setRemovingAvatar(true);

    try {
      const usuarioAtualizado = await removeAvatarFile<UsuarioLogado>();

      updateStoredUsuario(usuarioAtualizado);
      setAvatarFile(null);
      setForm((current) => ({
        ...current,
        foto_perfil: "",
        fotoUrl: "",
      }));
      setSucesso("Foto removida com sucesso.");
    } catch {
      setErro("Nao foi possivel remover a foto de perfil.");
    } finally {
      setRemovingAvatar(false);
    }
  }

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-zinc-950">Perfil</h2>

      <Feedback erro={erro} sucesso={sucesso} />

      <div className="mt-5 flex flex-col items-center rounded-[24px] bg-zinc-50 p-5">
        <Avatar className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-green-100 shadow-sm">
          {fotoSegura && (
            <AvatarImage
              src={fotoSegura}
              alt={form.nome}
              className="h-full w-full rounded-full object-cover"
            />
          )}

          <AvatarFallback className="h-full w-full rounded-full bg-green-100 text-2xl font-black text-green-800">
            {getInitials(form.nome)}
          </AvatarFallback>
        </Avatar>

        <div className="mt-5 grid w-full gap-3 sm:grid-cols-[1fr_auto]">
          <Campo label="Foto de perfil">
            <Input
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={handleAvatarChange}
              className="h-[50px] rounded-xl bg-white pt-3"
            />
          </Campo>

          <Button
            type="button"
            variant="outline"
            disabled={removingAvatar || loading || !fotoSegura}
            onClick={removerFoto}
            className="self-end h-[50px] rounded-xl border-red-100 bg-white font-bold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {removingAvatar ? "Removendo..." : "Remover"}
          </Button>
        </div>

        {avatarFile && <FileName name={avatarFile.name} />}
      </div>

      <div className="mt-5 grid gap-4">
        <Campo label="Nome">
          <Input
            value={form.nome}
            onChange={(event) => updateField("nome", event.target.value)}
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <Campo label="E-mail">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <Campo label="Telefone">
          <Input
            value={maskPhone(form.telefone)}
            onChange={(event) => updateField("telefone", event.target.value)}
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <Button
          type="button"
          disabled={loading || removingAvatar}
          onClick={salvarPerfil}
          className="h-[50px] rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>
    </section>
  );
}

function ConfigAcademia({
  academiaId,
  isDono,
}: {
  academiaId: string;
  isDono: boolean;
}) {
  const [form, setForm] = useState({
    nome: "",
    slug: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    logo_url: "",
    duracoes_reserva_minutos: DURACOES_RESERVA,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : ""),
    [logoFile]
  );
  const logoSegura = logoPreview || getSafeImageUrl(form.logo_url);

  useEffect(() => {
    if (!logoPreview) return;

    return () => {
      URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  useEffect(() => {
    async function carregarAcademia() {
      try {
        setLoading(true);
        const academia = await buscarAcademia(academiaId);
        setForm({
          nome: academia.nome ?? "",
          slug: academia.slug ?? "",
          cnpj: academia.cnpj ?? "",
          telefone: academia.telefone ?? "",
          email: academia.email ?? "",
          endereco: academia.endereco ?? "",
          cidade: academia.cidade ?? "",
          estado: academia.estado ?? "",
          cep: academia.cep ?? "",
          logo_url: academia.logo_url ?? "",
          duracoes_reserva_minutos:
            academia.duracoes_reserva_minutos?.length
              ? academia.duracoes_reserva_minutos
              : DURACOES_RESERVA,
        });
      } catch {
        setErro("Nao foi possivel carregar os dados da academia.");
      } finally {
        setLoading(false);
      }
    }

    void carregarAcademia();
  }, [academiaId]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleDuracao(duracao: DuracaoReserva, checked: boolean) {
    setForm((current) => {
      const duracoes = checked
        ? [...current.duracoes_reserva_minutos, duracao]
        : current.duracoes_reserva_minutos.filter((item) => item !== duracao);

      return {
        ...current,
        duracoes_reserva_minutos: DURACOES_RESERVA.filter((item) =>
          duracoes.includes(item),
        ),
      };
    });
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setLogoFile(null);
      return;
    }

    const error = validateAcademiaLogoFile(file);

    if (error) {
      setErro(error);
      event.target.value = "";
      setLogoFile(null);
      return;
    }

    setErro("");
    setSucesso("");
    setLogoFile(file);
  }

  function validarAcademia() {
    if (form.nome.trim().length < 3) return "Informe o nome da academia.";
    if (form.slug.trim().length < 3) return "Informe um slug valido.";
    if (form.cnpj && onlyNumbers(form.cnpj).length !== 14) {
      return "Informe um CNPJ valido.";
    }
    if (form.telefone && ![10, 11].includes(onlyNumbers(form.telefone).length)) {
      return "Informe um telefone valido.";
    }
    if (form.cep && onlyNumbers(form.cep).length !== 8) {
      return "Informe um CEP valido.";
    }
    if (form.estado && form.estado.trim().length !== 2) {
      return "Informe o estado com 2 letras.";
    }
    if (form.duracoes_reserva_minutos.length === 0) {
      return "Selecione pelo menos uma duracao de reserva.";
    }

    return "";
  }

  async function salvarAcademia() {
    const validationError = validarAcademia();

    if (validationError) {
      setErro(validationError);
      return;
    }

    setErro("");
    setSucesso("");
    setSaving(true);

    try {
      let academia = await atualizarAcademia(academiaId, {
        nome: form.nome.trim(),
        slug: slugify(form.slug),
        cnpj: onlyNumbers(form.cnpj) || null,
        telefone: onlyNumbers(form.telefone) || null,
        email: form.email.trim().toLowerCase() || null,
        endereco: form.endereco.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim().toUpperCase() || null,
        cep: onlyNumbers(form.cep) || null,
        duracoes_reserva_minutos: form.duracoes_reserva_minutos,
      });

      if (logoFile) {
        academia = await uploadAcademiaLogoFile<AcademiaDetalhes>(
          academiaId,
          logoFile
        );
      }

      setLogoFile(null);
      setForm((current) => ({
        ...current,
        nome: academia.nome ?? current.nome,
        slug: academia.slug ?? current.slug,
        cnpj: academia.cnpj ?? "",
        telefone: academia.telefone ?? "",
        email: academia.email ?? "",
        endereco: academia.endereco ?? "",
        cidade: academia.cidade ?? "",
        estado: academia.estado ?? "",
        cep: academia.cep ?? "",
        logo_url: academia.logo_url ?? current.logo_url,
        duracoes_reserva_minutos:
          academia.duracoes_reserva_minutos?.length
            ? academia.duracoes_reserva_minutos
            : current.duracoes_reserva_minutos,
      }));
      mergeAcademiaNoUsuario(academia);
      clearAcademiasCache();
      setSucesso("Academia atualizada com sucesso.");
    } catch {
      setErro("Nao foi possivel atualizar a academia.");
    } finally {
      setSaving(false);
    }
  }

  if (!isDono) {
    return (
      <p className="rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
        Apenas o dono da academia pode editar estes dados.
      </p>
    );
  }

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-zinc-950">Academia</h2>

      <Feedback erro={erro} sucesso={sucesso} />

      {loading ? (
        <p className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Carregando academia...
        </p>
      ) : (
        <>
          <div className="mt-5 flex flex-col items-center rounded-[24px] bg-zinc-50 p-5">
            <Avatar className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-green-100 shadow-sm">
              {logoSegura && (
                <AvatarImage
                  src={logoSegura}
                  alt={form.nome}
                  className="h-full w-full rounded-2xl object-cover"
                />
              )}

              <AvatarFallback className="h-full w-full rounded-2xl bg-green-100 text-green-800">
                <Building2 className="h-9 w-9" />
              </AvatarFallback>
            </Avatar>

            <div className="mt-5 w-full">
              <Campo label="Logo da academia">
                <Input
                  type="file"
                  accept={ACADEMIA_LOGO_ACCEPT}
                  onChange={handleLogoChange}
                  className="h-[50px] rounded-xl bg-white pt-3"
                />
              </Campo>

              {logoFile && <FileName name={logoFile.name} />}
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nome da academia">
                <Input
                  value={form.nome}
                  onChange={(event) => {
                    updateField("nome", event.target.value);
                    updateField("slug", slugify(event.target.value));
                  }}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="Slug">
                <Input
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", slugify(event.target.value))
                  }
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="CNPJ">
                <Input
                  value={maskCnpj(form.cnpj)}
                  onChange={(event) => updateField("cnpj", event.target.value)}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="Telefone">
                <Input
                  value={maskPhone(form.telefone)}
                  onChange={(event) =>
                    updateField("telefone", event.target.value)
                  }
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>
            </div>

            <Campo label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-[50px] rounded-xl bg-zinc-50"
              />
            </Campo>

            <Campo label="Endereço">
              <Input
                value={form.endereco}
                onChange={(event) => updateField("endereco", event.target.value)}
                className="h-[50px] rounded-xl bg-zinc-50"
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-[1fr_88px_140px]">
              <Campo label="Cidade">
                <Input
                  value={form.cidade}
                  onChange={(event) => updateField("cidade", event.target.value)}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="UF">
                <Input
                  value={form.estado}
                  maxLength={2}
                  onChange={(event) =>
                    updateField("estado", event.target.value.toUpperCase())
                  }
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="CEP">
                <Input
                  value={maskCep(form.cep)}
                  onChange={(event) => updateField("cep", event.target.value)}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>
            </div>

            <Campo label="Duracoes de reserva">
              <div className="grid gap-2 sm:grid-cols-3">
                {DURACOES_RESERVA.map((duracao) => {
                  const checked =
                    form.duracoes_reserva_minutos.includes(duracao);

                  return (
                    <label
                      key={duracao}
                      className={[
                        "flex h-[50px] items-center gap-3 rounded-xl border px-4 text-sm font-bold transition",
                        checked
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700",
                      ].join(" ")}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleDuracao(duracao, value === true)
                        }
                        className="border-zinc-300 data-checked:border-white data-checked:bg-white data-checked:text-zinc-950"
                      />
                      <span>{duracao} min</span>
                    </label>
                  );
                })}
              </div>
            </Campo>

            <Button
              type="button"
              disabled={saving}
              onClick={salvarAcademia}
              className="h-[50px] rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar academia"}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

function Feedback({ erro, sucesso }: { erro: string; sucesso: string }) {
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

function FileName({ name }: { name: string }) {
  return (
    <span className="mt-2 flex max-w-full items-center text-xs font-semibold text-zinc-500">
      <ImagePlus className="mr-1.5 h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}
