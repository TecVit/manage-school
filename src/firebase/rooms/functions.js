/* 
  Hierarquia de Status na Plataforma
  Os níveis de status são representados por números, onde um número menor
  indica mais privilégios, e um número maior indica menos funcionalidades.
  
  1 - Admin: Tem acesso total a todas as funcionalidades e configurações na plataforma.
  2 - Moderador: Pode gerenciar usuários e conteúdo, mas não tem acesso a configurações críticas.
  3 - Editor: Pode editar e publicar conteúdo, mas não pode gerenciar usuários.
  4 - Contribuidor: Pode criar conteúdo, mas precisa de aprovação para publicação.
  5 - Leitor: Pode apenas visualizar o conteúdo, sem capacidades de edição ou gerenciamento.
  6 - Membro: Tem acesso muito limitado, principalmente aos recursos básicos.
  
  Essa hierarquia garante que maiores privilégios estão associados a números menores.
*/

import { firestore, auth } from "../login/login";

