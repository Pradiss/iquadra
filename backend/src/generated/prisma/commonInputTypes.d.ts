import type * as runtime from "@prisma/client/runtime/client";
import * as $Enums from "./enums.js";
import type * as Prisma from "./internal/prismaNamespace.js";
export type StringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type EnumStatusUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusUsuario | Prisma.EnumStatusUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusUsuarioFilter<$PrismaModel> | $Enums.StatusUsuario;
};
export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type SortOrderInput = {
    sort: Prisma.SortOrder;
    nulls?: Prisma.NullsOrder;
};
export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type EnumStatusUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusUsuario | Prisma.EnumStatusUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.StatusUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusUsuarioFilter<$PrismaModel>;
};
export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type EnumCategoriaUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.CategoriaUsuario | Prisma.EnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCategoriaUsuarioFilter<$PrismaModel> | $Enums.CategoriaUsuario;
};
export type EnumCategoriaUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CategoriaUsuario | Prisma.EnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCategoriaUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.CategoriaUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCategoriaUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCategoriaUsuarioFilter<$PrismaModel>;
};
export type IntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type EnumPeriodoLimiteJogosFilter<$PrismaModel = never> = {
    equals?: $Enums.PeriodoLimiteJogos | Prisma.EnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    in?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPeriodoLimiteJogosFilter<$PrismaModel> | $Enums.PeriodoLimiteJogos;
};
export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type EnumPeriodoLimiteJogosWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PeriodoLimiteJogos | Prisma.EnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    in?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPeriodoLimiteJogosWithAggregatesFilter<$PrismaModel> | $Enums.PeriodoLimiteJogos;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPeriodoLimiteJogosFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPeriodoLimiteJogosFilter<$PrismaModel>;
};
export type EnumPerfilAcademiaUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.PerfilAcademiaUsuario | Prisma.EnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPerfilAcademiaUsuarioFilter<$PrismaModel> | $Enums.PerfilAcademiaUsuario;
};
export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type EnumPerfilAcademiaUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PerfilAcademiaUsuario | Prisma.EnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPerfilAcademiaUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.PerfilAcademiaUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPerfilAcademiaUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPerfilAcademiaUsuarioFilter<$PrismaModel>;
};
export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type EnumAuthTokenTipoFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthTokenTipo | Prisma.EnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    in?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuthTokenTipoFilter<$PrismaModel> | $Enums.AuthTokenTipo;
};
export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type EnumAuthTokenTipoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthTokenTipo | Prisma.EnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    in?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuthTokenTipoWithAggregatesFilter<$PrismaModel> | $Enums.AuthTokenTipo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAuthTokenTipoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAuthTokenTipoFilter<$PrismaModel>;
};
export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type EnumTipoPisoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPiso | Prisma.EnumTipoPisoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoPisoFilter<$PrismaModel> | $Enums.TipoPiso;
};
export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type EnumTipoPisoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPiso | Prisma.EnumTipoPisoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoPisoWithAggregatesFilter<$PrismaModel> | $Enums.TipoPiso;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoPisoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoPisoFilter<$PrismaModel>;
};
export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type EnumTipoBloqueioFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoBloqueio | Prisma.EnumTipoBloqueioFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoBloqueioFilter<$PrismaModel> | $Enums.TipoBloqueio;
};
export type EnumTipoBloqueioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoBloqueio | Prisma.EnumTipoBloqueioFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoBloqueioWithAggregatesFilter<$PrismaModel> | $Enums.TipoBloqueio;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoBloqueioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoBloqueioFilter<$PrismaModel>;
};
export type EnumTipoJogoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoJogo | Prisma.EnumTipoJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoJogoFilter<$PrismaModel> | $Enums.TipoJogo;
};
export type EnumStatusJogoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJogo | Prisma.EnumStatusJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusJogoFilter<$PrismaModel> | $Enums.StatusJogo;
};
export type EnumTipoJogoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoJogo | Prisma.EnumTipoJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoJogoWithAggregatesFilter<$PrismaModel> | $Enums.TipoJogo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoJogoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoJogoFilter<$PrismaModel>;
};
export type EnumStatusJogoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJogo | Prisma.EnumStatusJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusJogoWithAggregatesFilter<$PrismaModel> | $Enums.StatusJogo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusJogoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusJogoFilter<$PrismaModel>;
};
export type EnumPapelParticipanteFilter<$PrismaModel = never> = {
    equals?: $Enums.PapelParticipante | Prisma.EnumPapelParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPapelParticipanteFilter<$PrismaModel> | $Enums.PapelParticipante;
};
export type EnumStatusParticipanteFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusParticipante | Prisma.EnumStatusParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusParticipanteFilter<$PrismaModel> | $Enums.StatusParticipante;
};
export type EnumPapelParticipanteWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PapelParticipante | Prisma.EnumPapelParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPapelParticipanteWithAggregatesFilter<$PrismaModel> | $Enums.PapelParticipante;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPapelParticipanteFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPapelParticipanteFilter<$PrismaModel>;
};
export type EnumStatusParticipanteWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusParticipante | Prisma.EnumStatusParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusParticipanteWithAggregatesFilter<$PrismaModel> | $Enums.StatusParticipante;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusParticipanteFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusParticipanteFilter<$PrismaModel>;
};
export type EnumStatusConviteJogoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusConviteJogo | Prisma.EnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusConviteJogoFilter<$PrismaModel> | $Enums.StatusConviteJogo;
};
export type EnumStatusConviteJogoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusConviteJogo | Prisma.EnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusConviteJogoWithAggregatesFilter<$PrismaModel> | $Enums.StatusConviteJogo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusConviteJogoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusConviteJogoFilter<$PrismaModel>;
};
export type EnumStatusAulaFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAula | Prisma.EnumStatusAulaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAulaFilter<$PrismaModel> | $Enums.StatusAula;
};
export type EnumStatusAulaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAula | Prisma.EnumStatusAulaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAulaWithAggregatesFilter<$PrismaModel> | $Enums.StatusAula;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusAulaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusAulaFilter<$PrismaModel>;
};
export type EnumStatusRecorrenciaFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusRecorrencia | Prisma.EnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusRecorrenciaFilter<$PrismaModel> | $Enums.StatusRecorrencia;
};
export type EnumStatusRecorrenciaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusRecorrencia | Prisma.EnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusRecorrenciaWithAggregatesFilter<$PrismaModel> | $Enums.StatusRecorrencia;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusRecorrenciaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusRecorrenciaFilter<$PrismaModel>;
};
export type EnumStatusAmizadeFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAmizade | Prisma.EnumStatusAmizadeFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAmizadeFilter<$PrismaModel> | $Enums.StatusAmizade;
};
export type EnumStatusAmizadeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAmizade | Prisma.EnumStatusAmizadeFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAmizadeWithAggregatesFilter<$PrismaModel> | $Enums.StatusAmizade;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusAmizadeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusAmizadeFilter<$PrismaModel>;
};
export type EnumStatusAssinaturaFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAssinatura | Prisma.EnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAssinaturaFilter<$PrismaModel> | $Enums.StatusAssinatura;
};
export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
};
export type EnumStatusAssinaturaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAssinatura | Prisma.EnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAssinaturaWithAggregatesFilter<$PrismaModel> | $Enums.StatusAssinatura;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusAssinaturaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusAssinaturaFilter<$PrismaModel>;
};
export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
};
export type JsonNullableFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>, Required<JsonNullableFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>;
export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>, Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;
export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedJsonNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedJsonNullableFilter<$PrismaModel>;
};
export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type NestedEnumStatusUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusUsuario | Prisma.EnumStatusUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusUsuarioFilter<$PrismaModel> | $Enums.StatusUsuario;
};
export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type NestedEnumStatusUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusUsuario | Prisma.EnumStatusUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusUsuario[] | Prisma.ListEnumStatusUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.StatusUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusUsuarioFilter<$PrismaModel>;
};
export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type NestedEnumCategoriaUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.CategoriaUsuario | Prisma.EnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCategoriaUsuarioFilter<$PrismaModel> | $Enums.CategoriaUsuario;
};
export type NestedEnumCategoriaUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CategoriaUsuario | Prisma.EnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CategoriaUsuario[] | Prisma.ListEnumCategoriaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCategoriaUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.CategoriaUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCategoriaUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCategoriaUsuarioFilter<$PrismaModel>;
};
export type NestedEnumPeriodoLimiteJogosFilter<$PrismaModel = never> = {
    equals?: $Enums.PeriodoLimiteJogos | Prisma.EnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    in?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPeriodoLimiteJogosFilter<$PrismaModel> | $Enums.PeriodoLimiteJogos;
};
export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type NestedEnumPeriodoLimiteJogosWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PeriodoLimiteJogos | Prisma.EnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    in?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PeriodoLimiteJogos[] | Prisma.ListEnumPeriodoLimiteJogosFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPeriodoLimiteJogosWithAggregatesFilter<$PrismaModel> | $Enums.PeriodoLimiteJogos;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPeriodoLimiteJogosFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPeriodoLimiteJogosFilter<$PrismaModel>;
};
export type NestedEnumPerfilAcademiaUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.PerfilAcademiaUsuario | Prisma.EnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPerfilAcademiaUsuarioFilter<$PrismaModel> | $Enums.PerfilAcademiaUsuario;
};
export type NestedEnumPerfilAcademiaUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PerfilAcademiaUsuario | Prisma.EnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PerfilAcademiaUsuario[] | Prisma.ListEnumPerfilAcademiaUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPerfilAcademiaUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.PerfilAcademiaUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPerfilAcademiaUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPerfilAcademiaUsuarioFilter<$PrismaModel>;
};
export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableFilter<$PrismaModel> | number | null;
};
export type NestedEnumAuthTokenTipoFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthTokenTipo | Prisma.EnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    in?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuthTokenTipoFilter<$PrismaModel> | $Enums.AuthTokenTipo;
};
export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type NestedEnumAuthTokenTipoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthTokenTipo | Prisma.EnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    in?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AuthTokenTipo[] | Prisma.ListEnumAuthTokenTipoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAuthTokenTipoWithAggregatesFilter<$PrismaModel> | $Enums.AuthTokenTipo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAuthTokenTipoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAuthTokenTipoFilter<$PrismaModel>;
};
export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type NestedEnumTipoPisoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPiso | Prisma.EnumTipoPisoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoPisoFilter<$PrismaModel> | $Enums.TipoPiso;
};
export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type NestedEnumTipoPisoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPiso | Prisma.EnumTipoPisoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoPiso[] | Prisma.ListEnumTipoPisoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoPisoWithAggregatesFilter<$PrismaModel> | $Enums.TipoPiso;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoPisoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoPisoFilter<$PrismaModel>;
};
export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type NestedEnumTipoBloqueioFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoBloqueio | Prisma.EnumTipoBloqueioFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoBloqueioFilter<$PrismaModel> | $Enums.TipoBloqueio;
};
export type NestedEnumTipoBloqueioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoBloqueio | Prisma.EnumTipoBloqueioFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoBloqueio[] | Prisma.ListEnumTipoBloqueioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoBloqueioWithAggregatesFilter<$PrismaModel> | $Enums.TipoBloqueio;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoBloqueioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoBloqueioFilter<$PrismaModel>;
};
export type NestedEnumTipoJogoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoJogo | Prisma.EnumTipoJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoJogoFilter<$PrismaModel> | $Enums.TipoJogo;
};
export type NestedEnumStatusJogoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJogo | Prisma.EnumStatusJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusJogoFilter<$PrismaModel> | $Enums.StatusJogo;
};
export type NestedEnumTipoJogoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoJogo | Prisma.EnumTipoJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoJogo[] | Prisma.ListEnumTipoJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoJogoWithAggregatesFilter<$PrismaModel> | $Enums.TipoJogo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoJogoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoJogoFilter<$PrismaModel>;
};
export type NestedEnumStatusJogoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusJogo | Prisma.EnumStatusJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusJogo[] | Prisma.ListEnumStatusJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusJogoWithAggregatesFilter<$PrismaModel> | $Enums.StatusJogo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusJogoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusJogoFilter<$PrismaModel>;
};
export type NestedEnumPapelParticipanteFilter<$PrismaModel = never> = {
    equals?: $Enums.PapelParticipante | Prisma.EnumPapelParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPapelParticipanteFilter<$PrismaModel> | $Enums.PapelParticipante;
};
export type NestedEnumStatusParticipanteFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusParticipante | Prisma.EnumStatusParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusParticipanteFilter<$PrismaModel> | $Enums.StatusParticipante;
};
export type NestedEnumPapelParticipanteWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PapelParticipante | Prisma.EnumPapelParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PapelParticipante[] | Prisma.ListEnumPapelParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPapelParticipanteWithAggregatesFilter<$PrismaModel> | $Enums.PapelParticipante;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPapelParticipanteFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPapelParticipanteFilter<$PrismaModel>;
};
export type NestedEnumStatusParticipanteWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusParticipante | Prisma.EnumStatusParticipanteFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusParticipante[] | Prisma.ListEnumStatusParticipanteFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusParticipanteWithAggregatesFilter<$PrismaModel> | $Enums.StatusParticipante;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusParticipanteFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusParticipanteFilter<$PrismaModel>;
};
export type NestedEnumStatusConviteJogoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusConviteJogo | Prisma.EnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusConviteJogoFilter<$PrismaModel> | $Enums.StatusConviteJogo;
};
export type NestedEnumStatusConviteJogoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusConviteJogo | Prisma.EnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusConviteJogo[] | Prisma.ListEnumStatusConviteJogoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusConviteJogoWithAggregatesFilter<$PrismaModel> | $Enums.StatusConviteJogo;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusConviteJogoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusConviteJogoFilter<$PrismaModel>;
};
export type NestedEnumStatusAulaFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAula | Prisma.EnumStatusAulaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAulaFilter<$PrismaModel> | $Enums.StatusAula;
};
export type NestedEnumStatusAulaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAula | Prisma.EnumStatusAulaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAula[] | Prisma.ListEnumStatusAulaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAulaWithAggregatesFilter<$PrismaModel> | $Enums.StatusAula;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusAulaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusAulaFilter<$PrismaModel>;
};
export type NestedEnumStatusRecorrenciaFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusRecorrencia | Prisma.EnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusRecorrenciaFilter<$PrismaModel> | $Enums.StatusRecorrencia;
};
export type NestedEnumStatusRecorrenciaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusRecorrencia | Prisma.EnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusRecorrencia[] | Prisma.ListEnumStatusRecorrenciaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusRecorrenciaWithAggregatesFilter<$PrismaModel> | $Enums.StatusRecorrencia;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusRecorrenciaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusRecorrenciaFilter<$PrismaModel>;
};
export type NestedEnumStatusAmizadeFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAmizade | Prisma.EnumStatusAmizadeFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAmizadeFilter<$PrismaModel> | $Enums.StatusAmizade;
};
export type NestedEnumStatusAmizadeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAmizade | Prisma.EnumStatusAmizadeFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAmizade[] | Prisma.ListEnumStatusAmizadeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAmizadeWithAggregatesFilter<$PrismaModel> | $Enums.StatusAmizade;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusAmizadeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusAmizadeFilter<$PrismaModel>;
};
export type NestedEnumStatusAssinaturaFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAssinatura | Prisma.EnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAssinaturaFilter<$PrismaModel> | $Enums.StatusAssinatura;
};
export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
};
export type NestedEnumStatusAssinaturaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusAssinatura | Prisma.EnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    in?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatusAssinatura[] | Prisma.ListEnumStatusAssinaturaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatusAssinaturaWithAggregatesFilter<$PrismaModel> | $Enums.StatusAssinatura;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatusAssinaturaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatusAssinaturaFilter<$PrismaModel>;
};
export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel> | null;
    in?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    notIn?: runtime.Decimal[] | runtime.DecimalJsLike[] | number[] | string[] | Prisma.ListDecimalFieldRefInput<$PrismaModel> | null;
    lt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    lte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gt?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    gte?: runtime.Decimal | runtime.DecimalJsLike | number | string | Prisma.DecimalFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDecimalNullableFilter<$PrismaModel>;
};
export type NestedJsonNullableFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>, Required<NestedJsonNullableFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>;
export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
//# sourceMappingURL=commonInputTypes.d.ts.map