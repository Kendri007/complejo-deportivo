import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addComplexAdminByEmail,
  createComplex,
  deleteComplex,
  getComplex,
  listComplexAdmins,
  listComplexes,
  removeComplexAdmin,
  updateComplex,
} from '@/features/complexes/api'
import type { ComplexInsert, ComplexUpdate } from '@/features/complexes/types'

export function useComplexes() {
  return useQuery({ queryKey: ['complexes'], queryFn: listComplexes })
}

export function useComplex(id: string | undefined) {
  return useQuery({
    queryKey: ['complexes', id],
    queryFn: () => getComplex(id!),
    enabled: !!id,
  })
}

export function useCreateComplex() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ComplexInsert) => createComplex(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complexes'] }),
  })
}

export function useUpdateComplex(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: ComplexUpdate) => updateComplex(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] })
      queryClient.invalidateQueries({ queryKey: ['complexes', id] })
    },
  })
}

export function useDeleteComplex() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteComplex(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complexes'] }),
  })
}

export function useComplexAdmins(complexId: string | undefined) {
  return useQuery({
    queryKey: ['complex-admins', complexId],
    queryFn: () => listComplexAdmins(complexId!),
    enabled: !!complexId,
  })
}

export function useAddComplexAdmin(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => addComplexAdminByEmail(complexId, email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complex-admins', complexId] }),
  })
}

export function useRemoveComplexAdmin(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (complexAdminRowId: string) => removeComplexAdmin(complexAdminRowId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complex-admins', complexId] }),
  })
}
