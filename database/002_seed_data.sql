-- =============================================================================
-- MedCom Seed Data — Sample Drugs & Interactions
-- For development and testing purposes only
-- =============================================================================

-- Insert sample drugs (common medications)
INSERT INTO health.drugs (id, name, international_name, active_substances, atc_code, atc_description, dosage_form, strength, route_of_administration, manufacturer) VALUES
    ('a0000001-0000-0000-0000-000000000001', 'Doliprane', 'Paracetamol', ARRAY['paracetamol'], 'N02BE01', 'Paracetamol', 'Tablet', '1000mg', 'Oral', 'Sanofi'),
    ('a0000001-0000-0000-0000-000000000002', 'Kardegic', 'Acetylsalicylic acid', ARRAY['acetylsalicylic_acid'], 'B01AC06', 'Acetylsalicylic acid', 'Powder', '75mg', 'Oral', 'Sanofi'),
    ('a0000001-0000-0000-0000-000000000003', 'Metformine', 'Metformin', ARRAY['metformin'], 'A10BA02', 'Metformin', 'Tablet', '850mg', 'Oral', 'Merck'),
    ('a0000001-0000-0000-0000-000000000004', 'Levothyrox', 'Levothyroxine', ARRAY['levothyroxine'], 'H03AA01', 'Levothyroxine sodium', 'Tablet', '100mcg', 'Oral', 'Merck'),
    ('a0000001-0000-0000-0000-000000000005', 'Coumadine', 'Warfarin', ARRAY['warfarin'], 'B01AA03', 'Warfarin', 'Tablet', '5mg', 'Oral', 'Bristol-Myers Squibb'),
    ('a0000001-0000-0000-0000-000000000006', 'Amoxicilline', 'Amoxicillin', ARRAY['amoxicillin'], 'J01CA04', 'Amoxicillin', 'Capsule', '500mg', 'Oral', 'Sandoz'),
    ('a0000001-0000-0000-0000-000000000007', 'Ibuprofene', 'Ibuprofen', ARRAY['ibuprofen'], 'M01AE01', 'Ibuprofen', 'Tablet', '400mg', 'Oral', 'Mylan'),
    ('a0000001-0000-0000-0000-000000000008', 'Omeprazole', 'Omeprazole', ARRAY['omeprazole'], 'A02BC01', 'Omeprazole', 'Capsule', '20mg', 'Oral', 'AstraZeneca'),
    ('a0000001-0000-0000-0000-000000000009', 'Atorvastatine', 'Atorvastatin', ARRAY['atorvastatin'], 'C10AA05', 'Atorvastatin', 'Tablet', '20mg', 'Oral', 'Pfizer'),
    ('a0000001-0000-0000-0000-000000000010', 'Ramipril', 'Ramipril', ARRAY['ramipril'], 'C09AA05', 'Ramipril', 'Tablet', '5mg', 'Oral', 'Sanofi'),
    ('a0000001-0000-0000-0000-000000000011', 'Amlodipine', 'Amlodipine', ARRAY['amlodipine'], 'C08CA01', 'Amlodipine', 'Tablet', '5mg', 'Oral', 'Pfizer'),
    ('a0000001-0000-0000-0000-000000000012', 'Clopidogrel', 'Clopidogrel', ARRAY['clopidogrel'], 'B01AC04', 'Clopidogrel', 'Tablet', '75mg', 'Oral', 'Sanofi'),
    ('a0000001-0000-0000-0000-000000000013', 'Fluoxetine', 'Fluoxetine', ARRAY['fluoxetine'], 'N06AB03', 'Fluoxetine', 'Capsule', '20mg', 'Oral', 'Lilly'),
    ('a0000001-0000-0000-0000-000000000014', 'Bisoprolol', 'Bisoprolol', ARRAY['bisoprolol'], 'C07AB07', 'Bisoprolol', 'Tablet', '5mg', 'Oral', 'Merck'),
    ('a0000001-0000-0000-0000-000000000015', 'Tramadol', 'Tramadol', ARRAY['tramadol'], 'N02AX02', 'Tramadol', 'Capsule', '50mg', 'Oral', 'Grünenthal');

-- Insert sample drug-drug interactions
INSERT INTO health.drug_interactions (drug_a_id, drug_b_id, interaction_type, severity, clinical_explanation, patient_explanation, recommendation, mechanism, evidence_level, confidence_score, sources) VALUES
    -- Warfarin + Ibuprofen (RED)
    ('a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000007',
     'drug_drug', 'red',
     'L''association warfarine-ibuprofène augmente significativement le risque hémorragique. Les AINS inhibent la fonction plaquettaire et peuvent provoquer des ulcérations gastro-intestinales, potentialisant l''effet anticoagulant de la warfarine.',
     'Prendre ces deux médicaments ensemble peut augmenter fortement le risque de saignement. C''est une combinaison dangereuse.',
     'Éviter cette association. Si un antalgique est nécessaire, privilégier le paracétamol. Consulter immédiatement votre médecin.',
     'Inhibition de la COX-1 plaquettaire par l''ibuprofène + effet anticoagulant de la warfarine',
     'Level A', 0.98,
     '["Thrombolysis in Myocardial Infarction (TIMI) guidelines", "ANSM Thesaurus des interactions médicamenteuses", "European Heart Journal 2021"]'),

    -- Warfarin + Aspirin (YELLOW)
    ('a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000002',
     'drug_drug', 'yellow',
     'L''association warfarine-aspirine à faible dose augmente le risque hémorragique mais peut être justifiée dans certaines indications cardiovasculaires sous surveillance étroite de l''INR.',
     'Cette combinaison augmente le risque de saignement. Elle peut être prescrite dans certains cas, mais nécessite une surveillance régulière.',
     'Association possible sous surveillance médicale stricte. Contrôle INR rapproché recommandé. Signaler tout saignement inhabituel.',
     'Double inhibition de l''hémostase : anticoagulation + antiagrégation plaquettaire',
     'Level A', 0.95,
     '["ESC Guidelines on Cardiovascular Disease Prevention 2021", "ANSM Thesaurus des interactions médicamenteuses"]'),

    -- Metformin + Ibuprofen (YELLOW)
    ('a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000007',
     'drug_drug', 'yellow',
     'Les AINS peuvent altérer la fonction rénale et augmenter le risque d''acidose lactique chez les patients sous metformine, particulièrement en cas d''insuffisance rénale préexistante.',
     'L''ibuprofène peut affecter vos reins et rendre la metformine moins sûre. Parlez-en à votre médecin.',
     'Utilisation prudente. Surveiller la fonction rénale. Éviter l''utilisation prolongée d''AINS. Hydratation adéquate recommandée.',
     'Réduction du débit de filtration glomérulaire par les AINS, accumulation de metformine',
     'Level B', 0.88,
     '["Diabetes Care 2020", "ANSM Thesaurus des interactions médicamenteuses"]'),

    -- Fluoxetine + Tramadol (RED)
    ('a0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000015',
     'drug_drug', 'red',
     'L''association fluoxétine-tramadol présente un risque de syndrome sérotoninergique potentiellement fatal. La fluoxétine inhibe le CYP2D6, réduisant la conversion du tramadol en métabolite actif tout en augmentant le risque sérotoninergique.',
     'Prendre ces deux médicaments ensemble peut provoquer un syndrome sérotoninergique dangereux (fièvre, agitation, tremblements). C''est une combinaison à éviter.',
     'Association contre-indiquée. Choisir un antalgique alternatif. En cas de symptômes (fièvre, agitation, tremblements), consulter en urgence.',
     'Inhibition du CYP2D6 + synergie sérotoninergique (ISRS + agoniste sérotoninergique)',
     'Level A', 0.96,
     '["FDA Drug Safety Communication 2016", "ANSM Thesaurus des interactions médicamenteuses", "British Journal of Clinical Pharmacology 2019"]'),

    -- Levothyroxine + Omeprazole (YELLOW)
    ('a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000008',
     'drug_drug', 'yellow',
     'Les inhibiteurs de la pompe à protons comme l''oméprazole réduisent l''acidité gastrique nécessaire à l''absorption optimale de la lévothyroxine, pouvant entraîner une hypothyroïdie mal contrôlée.',
     'L''oméprazole peut réduire l''absorption de votre médicament pour la thyroïde. Un ajustement peut être nécessaire.',
     'Prendre la lévothyroxine à jeun, au moins 4 heures avant l''oméprazole. Contrôler la TSH après introduction de l''IPP.',
     'Réduction de l''absorption gastrique de la lévothyroxine par élévation du pH gastrique',
     'Level B', 0.85,
     '["Thyroid 2019", "ANSM Thesaurus des interactions médicamenteuses"]'),

    -- Atorvastatin + Amlodipine (GREEN)
    ('a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000011',
     'drug_drug', 'green',
     'L''amlodipine peut légèrement augmenter les concentrations plasmatiques d''atorvastatine via l''inhibition du CYP3A4. L''interaction est généralement cliniquement non significative aux doses standard.',
     'Ces deux médicaments peuvent être pris ensemble en toute sécurité aux doses habituelles.',
     'Aucune modification nécessaire aux doses standard. Surveiller les symptômes musculaires (myalgies) si doses élevées d''atorvastatine.',
     'Inhibition modérée du CYP3A4 par l''amlodipine',
     'Level B', 0.82,
     '["Clinical Pharmacology & Therapeutics 2018", "EMA Assessment Report"]'),

    -- Drug-Age interaction: Ibuprofen for elderly
    ('a0000001-0000-0000-0000-000000000007', NULL,
     'drug_age', 'yellow',
     'Les AINS sont associés à un risque accru d''effets indésirables gastro-intestinaux, rénaux et cardiovasculaires chez les patients de plus de 65 ans.',
     'L''ibuprofène présente des risques accrus pour les personnes âgées. Discutez d''alternatives avec votre médecin.',
     'Utiliser la dose minimale efficace pour la durée la plus courte possible. Envisager le paracétamol comme alternative. Surveillance rénale recommandée.',
     'Diminution de la fonction rénale liée à l''âge, fragilité muqueuse gastrique',
     'Level A', 0.92,
     '["Beers Criteria 2023", "HAS Recommandations gériatriques"]'),

    -- Drug-Renal interaction: Metformin
    ('a0000001-0000-0000-0000-000000000003', NULL,
     'drug_renal', 'red',
     'La metformine est contre-indiquée en cas d''insuffisance rénale sévère (DFGe < 30 mL/min) en raison du risque d''acidose lactique. Ajustement posologique nécessaire si DFGe entre 30-45 mL/min.',
     'Si vos reins ne fonctionnent pas bien, la metformine peut s''accumuler et devenir dangereuse. Votre médecin doit adapter la dose.',
     'Contre-indiqué si DFGe < 30. Réduire la dose si DFGe 30-45. Contrôle régulier de la fonction rénale obligatoire.',
     'Élimination rénale exclusive de la metformine, accumulation en cas d''insuffisance rénale',
     'Level A', 0.97,
     '["KDIGO Guidelines 2022", "ANSM RCP Metformine"]'),

    -- Drug-Food interaction: Warfarin + Vitamin K foods
    ('a0000001-0000-0000-0000-000000000005', NULL,
     'drug_food', 'yellow',
     'Les aliments riches en vitamine K (épinards, brocoli, chou) peuvent réduire l''efficacité de la warfarine. Un apport constant en vitamine K est recommandé plutôt qu''une éviction totale.',
     'Certains aliments verts (épinards, brocoli, chou) peuvent réduire l''efficacité de votre anticoagulant. Maintenez une alimentation régulière.',
     'Maintenir un apport constant en vitamine K. Ne pas modifier brutalement son alimentation. Informer le médecin de tout changement alimentaire.',
     'Antagonisme pharmacodynamique : la vitamine K est cofacteur de la synthèse des facteurs de coagulation',
     'Level A', 0.94,
     '["American Heart Association Guidelines", "ANSM Thesaurus des interactions médicamenteuses"]');

-- Insert sample drug-disease contraindications
INSERT INTO health.drug_interactions (drug_a_id, drug_b_id, interaction_type, severity, clinical_explanation, patient_explanation, recommendation, condition_trigger, confidence_score, sources) VALUES
    -- Ibuprofen + Asthma
    ('a0000001-0000-0000-0000-000000000007', NULL,
     'drug_disease', 'red',
     'Les AINS peuvent déclencher un bronchospasme sévère chez les patients asthmatiques, particulièrement ceux présentant une triade de Widal (asthme, polypose nasale, intolérance à l''aspirine).',
     'L''ibuprofène peut aggraver votre asthme et provoquer une crise grave. Utilisez du paracétamol à la place.',
     'Contre-indiqué en cas d''asthme à l''aspirine. Utiliser le paracétamol comme alternative. Consulter en urgence en cas de gêne respiratoire.',
     'asthma', 0.95,
     '["GINA Guidelines 2023", "ANSM"]'),

    -- Metformin + Heart Failure
    ('a0000001-0000-0000-0000-000000000003', NULL,
     'drug_disease', 'yellow',
     'La metformine était historiquement contre-indiquée en insuffisance cardiaque, mais les données récentes montrent un bénéfice potentiel en IC stable. Reste contre-indiquée en IC aiguë/décompensée.',
     'Si vous avez une insuffisance cardiaque, votre médecin doit évaluer si la metformine est adaptée à votre situation.',
     'Utilisable en IC stable sous surveillance. Contre-indiquée en IC aiguë ou décompensée. Surveillance de la fonction rénale.',
     'heart_failure', 0.88,
     '["ESC Guidelines on Heart Failure 2023", "ADA Standards of Care 2024"]');
