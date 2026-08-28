-- Bucket público para fotos de portada de los complejos. Cada archivo se
-- sube como "{complex_id}/{nombre}", así la policy de escritura puede
-- verificar is_complex_admin() sobre esa carpeta sin necesitar una tabla
-- aparte para trackear ownership de archivos.
insert into storage.buckets (id, name, public)
values ('complex-photos', 'complex-photos', true)
on conflict (id) do nothing;

drop policy if exists "complex_photos_public_read" on storage.objects;
create policy "complex_photos_public_read" on storage.objects
  for select using (bucket_id = 'complex-photos');

  drop policy if exists "complex_photos_admin_write" on storage.objects;
  create policy "complex_photos_admin_write" on storage.objects
    for insert with check (
        bucket_id = 'complex-photos'
            and (
                  public.is_super_admin()
                        or public.is_complex_admin(((storage.foldername(name))[1])::uuid)
                            )
                              );

                              drop policy if exists "complex_photos_admin_update" on storage.objects;
                              create policy "complex_photos_admin_update" on storage.objects
                                for update using (
                                    bucket_id = 'complex-photos'
                                        and (
                                              public.is_super_admin()
                                                    or public.is_complex_admin(((storage.foldername(name))[1])::uuid)
                                                        )
                                                          );

                                                          drop policy if exists "complex_photos_admin_delete" on storage.objects;
                                                          create policy "complex_photos_admin_delete" on storage.objects
                                                            for delete using (
                                                                bucket_id = 'complex-photos'
                                                                    and (
                                                                          public.is_super_admin()
                                                                                or public.is_complex_admin(((storage.foldername(name))[1])::uuid)
                                                                                    )
                                                                                      );
                                                                                      