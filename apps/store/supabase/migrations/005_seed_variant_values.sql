-- Asegura que existan variant_types (por si 002 no se ejecutó)
INSERT INTO variant_types (name, slug)
VALUES ('Color', 'color'), ('Talle', 'talle')
ON CONFLICT (slug) DO NOTHING;

-- Seed variant_values (ejecutar después de 004)
INSERT INTO variant_values (variant_type_id, value)
SELECT id, unnest(ARRAY['Rojo', 'Negro', 'Blanco', 'Azul'])
FROM variant_types WHERE slug = 'color'
ON CONFLICT (variant_type_id, value) DO NOTHING;

INSERT INTO variant_values (variant_type_id, value)
SELECT id, unnest(ARRAY['S', 'M', 'L', 'XL'])
FROM variant_types WHERE slug = 'talle'
ON CONFLICT (variant_type_id, value) DO NOTHING;
