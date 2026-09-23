// Generated from Supabase project TURKSTILHOUSE-CORE. Do not edit by hand.
// Regenerate: see README → "Veritabanı tipleri".

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      actual_outcomes: {
        Row: {
          accuracy_score: number | null
          evidence: Json
          id: string
          matched: boolean | null
          observed_at: string
          outcome: string
          prediction_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          evidence?: Json
          id?: string
          matched?: boolean | null
          observed_at?: string
          outcome: string
          prediction_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          evidence?: Json
          id?: string
          matched?: boolean | null
          observed_at?: string
          outcome?: string
          prediction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actual_outcomes_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_assignments: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          error: Json | null
          id: string
          input: Json
          orchestration_run_id: string
          organization_id: string
          output: Json
          sequence_no: number
          started_at: string | null
          status: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          error?: Json | null
          id?: string
          input?: Json
          orchestration_run_id: string
          organization_id: string
          output?: Json
          sequence_no: number
          started_at?: string | null
          status?: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          error?: Json | null
          id?: string
          input?: Json
          orchestration_run_id?: string
          organization_id?: string
          output?: Json
          sequence_no?: number
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_assignments_orchestration_run_id_fkey"
            columns: ["orchestration_run_id"]
            isOneToOne: false
            referencedRelation: "orchestration_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          active: boolean
          agent_key: string
          autonomy_level: string
          capabilities: Json
          category: string
          created_at: string
          display_name: string
          id: string
          metadata: Json
          mission: string | null
          organization_id: string
          role: string
          system_contract: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          agent_key: string
          autonomy_level?: string
          capabilities?: Json
          category: string
          created_at?: string
          display_name: string
          id?: string
          metadata?: Json
          mission?: string | null
          organization_id: string
          role: string
          system_contract?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          agent_key?: string
          autonomy_level?: string
          capabilities?: Json
          category?: string
          created_at?: string
          display_name?: string
          id?: string
          metadata?: Json
          mission?: string | null
          organization_id?: string
          role?: string
          system_contract?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          active: boolean
          cached_input_cost_per_1m: number | null
          context_window: number | null
          created_at: string
          id: string
          input_cost_per_1m: number | null
          metadata: Json
          modality: string[]
          model_key: string
          name: string
          output_cost_per_1m: number | null
          provider_id: string
          quality_tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cached_input_cost_per_1m?: number | null
          context_window?: number | null
          created_at?: string
          id?: string
          input_cost_per_1m?: number | null
          metadata?: Json
          modality?: string[]
          model_key: string
          name: string
          output_cost_per_1m?: number | null
          provider_id: string
          quality_tier?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cached_input_cost_per_1m?: number | null
          context_window?: number | null
          created_at?: string
          id?: string
          input_cost_per_1m?: number | null
          metadata?: Json
          modality?: string[]
          model_key?: string
          name?: string
          output_cost_per_1m?: number | null
          provider_id?: string
          quality_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          metadata: Json
          name: string
          provider_type: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          provider_type?: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          provider_type?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      ai_tools: {
        Row: {
          active: boolean
          capabilities: Json
          cost_notes: string | null
          created_at: string
          endpoint: string | null
          id: string
          name: string
          provider_name: string | null
          slug: string
          tool_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          capabilities?: Json
          cost_notes?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          name: string
          provider_name?: string | null
          slug: string
          tool_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          capabilities?: Json
          cost_notes?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          name?: string
          provider_name?: string | null
          slug?: string
          tool_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_builds: {
        Row: {
          created_at: string
          deployment_url: string | null
          id: string
          name: string
          organization_id: string
          project_id: string | null
          repository_url: string | null
          requirements: Json
          stack: Json
          status: string
          target: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deployment_url?: string | null
          id?: string
          name: string
          organization_id: string
          project_id?: string | null
          repository_url?: string | null
          requirements?: Json
          stack?: Json
          status?: string
          target?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deployment_url?: string | null
          id?: string
          name?: string
          organization_id?: string
          project_id?: string | null
          repository_url?: string | null
          requirements?: Json
          stack?: Json
          status?: string
          target?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_builds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_builds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          artifact_type: string
          created_at: string
          external_url: string | null
          id: string
          metadata: Json
          name: string
          organization_id: string
          project_id: string | null
          storage_path: string | null
          task_id: string | null
          workflow_run_id: string | null
        }
        Insert: {
          artifact_type: string
          created_at?: string
          external_url?: string | null
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          project_id?: string | null
          storage_path?: string | null
          task_id?: string | null
          workflow_run_id?: string | null
        }
        Update: {
          artifact_type?: string
          created_at?: string
          external_url?: string | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          project_id?: string | null
          storage_path?: string | null
          task_id?: string | null
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      capabilities: {
        Row: {
          capability_key: string
          created_at: string
          deprecated: boolean
          deprecated_at: string | null
          deprecation_reason: string | null
          description: string | null
          enabled: boolean
          id: string
          integration_id: string | null
          organization_id: string
          risk_level: string
          updated_at: string
        }
        Insert: {
          capability_key: string
          created_at?: string
          deprecated?: boolean
          deprecated_at?: string | null
          deprecation_reason?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          integration_id?: string | null
          organization_id: string
          risk_level?: string
          updated_at?: string
        }
        Update: {
          capability_key?: string
          created_at?: string
          deprecated?: boolean
          deprecated_at?: string | null
          deprecation_reason?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          integration_id?: string | null
          organization_id?: string
          risk_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capabilities_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          aesthetic: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          organization_id: string
          season: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          aesthetic?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          season?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          aesthetic?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          season?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_events: {
        Row: {
          amount_usd: number
          budget_limit_usd: number | null
          cached_tokens: number | null
          created_at: string
          event_type: string
          id: string
          input_tokens: number | null
          integration_id: string | null
          model_name: string | null
          organization_id: string | null
          output_tokens: number | null
          provider_name: string | null
          task_id: string | null
          task_run_id: string | null
          tool_calls: number | null
          web_calls: number | null
        }
        Insert: {
          amount_usd?: number
          budget_limit_usd?: number | null
          cached_tokens?: number | null
          created_at?: string
          event_type: string
          id?: string
          input_tokens?: number | null
          integration_id?: string | null
          model_name?: string | null
          organization_id?: string | null
          output_tokens?: number | null
          provider_name?: string | null
          task_id?: string | null
          task_run_id?: string | null
          tool_calls?: number | null
          web_calls?: number | null
        }
        Update: {
          amount_usd?: number
          budget_limit_usd?: number | null
          cached_tokens?: number | null
          created_at?: string
          event_type?: string
          id?: string
          input_tokens?: number | null
          integration_id?: string | null
          model_name?: string | null
          organization_id?: string | null
          output_tokens?: number | null
          provider_name?: string | null
          task_id?: string | null
          task_run_id?: string | null
          tool_calls?: number | null
          web_calls?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_events_task_run_id_fkey"
            columns: ["task_run_id"]
            isOneToOne: false
            referencedRelation: "task_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string | null
          consent_data: Json
          country: string | null
          created_at: string
          customer_code: string | null
          email: string | null
          id: string
          name: string | null
          organization_id: string | null
          phone: string | null
          preferences: Json
          updated_at: string
        }
        Insert: {
          city?: string | null
          consent_data?: Json
          country?: string | null
          created_at?: string
          customer_code?: string | null
          email?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Update: {
          city?: string | null
          consent_data?: Json
          country?: string | null
          created_at?: string
          customer_code?: string | null
          email?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          approved_by: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_type: string
          id: string
          options: Json
          organization_id: string | null
          question: string
          rationale: string | null
          selected_option: Json | null
          status: string
          task_id: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_type: string
          id?: string
          options?: Json
          organization_id?: string | null
          question: string
          rationale?: string | null
          selected_option?: Json | null
          status?: string
          task_id?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_type?: string
          id?: string
          options?: Json
          organization_id?: string | null
          question?: string
          rationale?: string | null
          selected_option?: Json | null
          status?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string
          evaluation_type: string
          evaluator_expert_id: string | null
          findings: Json
          id: string
          integration_id: string | null
          pass: boolean | null
          recommended_action: string | null
          score: number | null
          task_id: string | null
          task_run_id: string | null
        }
        Insert: {
          created_at?: string
          evaluation_type: string
          evaluator_expert_id?: string | null
          findings?: Json
          id?: string
          integration_id?: string | null
          pass?: boolean | null
          recommended_action?: string | null
          score?: number | null
          task_id?: string | null
          task_run_id?: string | null
        }
        Update: {
          created_at?: string
          evaluation_type?: string
          evaluator_expert_id?: string | null
          findings?: Json
          id?: string
          integration_id?: string | null
          pass?: boolean | null
          recommended_action?: string | null
          score?: number | null
          task_id?: string | null
          task_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_expert_id_fkey"
            columns: ["evaluator_expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_task_run_id_fkey"
            columns: ["task_run_id"]
            isOneToOne: false
            referencedRelation: "task_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_capabilities: {
        Row: {
          capability: string
          created_at: string
          evidence: Json
          expert_id: string
          id: string
          proficiency: number | null
        }
        Insert: {
          capability: string
          created_at?: string
          evidence?: Json
          expert_id: string
          id?: string
          proficiency?: number | null
        }
        Update: {
          capability?: string
          created_at?: string
          evidence?: Json
          expert_id?: string
          id?: string
          proficiency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_capabilities_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_evaluations: {
        Row: {
          accuracy_score: number | null
          cost_score: number | null
          evaluated_at: string
          evidence: Json
          expert_id: string
          human_approval: boolean | null
          id: string
          outcome_status: string | null
          quality_score: number | null
          reliability_score: number | null
          speed_score: number | null
          task_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          cost_score?: number | null
          evaluated_at?: string
          evidence?: Json
          expert_id: string
          human_approval?: boolean | null
          id?: string
          outcome_status?: string | null
          quality_score?: number | null
          reliability_score?: number | null
          speed_score?: number | null
          task_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          cost_score?: number | null
          evaluated_at?: string
          evidence?: Json
          expert_id?: string
          human_approval?: boolean | null
          id?: string
          outcome_status?: string | null
          quality_score?: number | null
          reliability_score?: number | null
          speed_score?: number | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_evaluations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          expert_type: string
          future_plans: Json
          id: string
          metadata: Json
          methods: Json
          name: string
          organization_id: string | null
          predictions: Json
          preferences: Json
          role_name: string | null
          specialty: string | null
          strengths: Json
          updated_at: string
          weaknesses: Json
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          expert_type: string
          future_plans?: Json
          id?: string
          metadata?: Json
          methods?: Json
          name: string
          organization_id?: string | null
          predictions?: Json
          preferences?: Json
          role_name?: string | null
          specialty?: string | null
          strengths?: Json
          updated_at?: string
          weaknesses?: Json
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          expert_type?: string
          future_plans?: Json
          id?: string
          metadata?: Json
          methods?: Json
          name?: string
          organization_id?: string | null
          predictions?: Json
          preferences?: Json
          role_name?: string | null
          specialty?: string | null
          strengths?: Json
          updated_at?: string
          weaknesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "experts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fabric_stock: {
        Row: {
          available_m2: number
          created_at: string
          currency: string
          fabric_id: string
          id: string
          location: string | null
          metadata: Json
          organization_id: string
          reserved_m2: number
          roll_code: string | null
          status: string
          supplier_id: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          available_m2?: number
          created_at?: string
          currency?: string
          fabric_id: string
          id?: string
          location?: string | null
          metadata?: Json
          organization_id: string
          reserved_m2?: number
          roll_code?: string | null
          status?: string
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          available_m2?: number
          created_at?: string
          currency?: string
          fabric_id?: string
          id?: string
          location?: string | null
          metadata?: Json
          organization_id?: string
          reserved_m2?: number
          roll_code?: string | null
          status?: string
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fabric_stock_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabric_stock_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabric_stock_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      fabrics: {
        Row: {
          color: string | null
          composition: string | null
          created_at: string
          currency: string | null
          fabric_code: string | null
          fiber_content: Json
          finish: string | null
          id: string
          metadata: Json
          name: string
          organization_id: string | null
          origin: string | null
          pattern: string | null
          price_per_m2: number | null
          stock_m2: number | null
          supplier_id: string | null
          sustainability_data: Json
          updated_at: string
          weave_type: string | null
          weight_gsm: number | null
          width_cm: number | null
        }
        Insert: {
          color?: string | null
          composition?: string | null
          created_at?: string
          currency?: string | null
          fabric_code?: string | null
          fiber_content?: Json
          finish?: string | null
          id?: string
          metadata?: Json
          name: string
          organization_id?: string | null
          origin?: string | null
          pattern?: string | null
          price_per_m2?: number | null
          stock_m2?: number | null
          supplier_id?: string | null
          sustainability_data?: Json
          updated_at?: string
          weave_type?: string | null
          weight_gsm?: number | null
          width_cm?: number | null
        }
        Update: {
          color?: string | null
          composition?: string | null
          created_at?: string
          currency?: string | null
          fabric_code?: string | null
          fiber_content?: Json
          finish?: string | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string | null
          origin?: string | null
          pattern?: string | null
          price_per_m2?: number | null
          stock_m2?: number | null
          supplier_id?: string | null
          sustainability_data?: Json
          updated_at?: string
          weave_type?: string | null
          weight_gsm?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fabrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrics_supplier_fk"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      human_approval_requests: {
        Row: {
          approval_type: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          organization_id: string
          payload: Json
          reason: string
          status: string
          task_id: string | null
          workflow_run_id: string | null
        }
        Insert: {
          approval_type: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          organization_id: string
          payload?: Json
          reason: string
          status?: string
          task_id?: string | null
          workflow_run_id?: string | null
        }
        Update: {
          approval_type?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          organization_id?: string
          payload?: Json
          reason?: string
          status?: string
          task_id?: string | null
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "human_approval_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "human_approval_requests_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "human_approval_requests_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_surfaces: {
        Row: {
          created_at: string
          id: string
          integration_id: string
          last_checked_at: string | null
          last_error: string | null
          metadata: Json
          scopes: Json
          surface: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_id: string
          last_checked_at?: string | null
          last_error?: string | null
          metadata?: Json
          scopes?: Json
          surface: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_id?: string
          last_checked_at?: string | null
          last_error?: string | null
          metadata?: Json
          scopes?: Json
          surface?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_surfaces_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          capabilities: Json
          category: string | null
          config_ref: string | null
          connection_surface: string
          created_at: string
          id: string
          last_checked_at: string | null
          last_error: string | null
          name: string
          organization_id: string
          provider: string
          risk_level: string
          scopes: Json
          status: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          capabilities?: Json
          category?: string | null
          config_ref?: string | null
          connection_surface?: string
          created_at?: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          name: string
          organization_id: string
          provider: string
          risk_level?: string
          scopes?: Json
          status?: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          capabilities?: Json
          category?: string | null
          config_ref?: string | null
          connection_surface?: string
          created_at?: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          name?: string
          organization_id?: string
          provider?: string
          risk_level?: string
          scopes?: Json
          status?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          embedding_model: string | null
          id: string
          metadata: Json
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          embedding_model?: string | null
          id?: string
          metadata?: Json
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          embedding_model?: string | null
          id?: string
          metadata?: Json
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          content: string | null
          content_hash: string | null
          created_at: string
          document_type: string | null
          id: string
          language: string | null
          metadata: Json
          organization_id: string | null
          source_id: string | null
          title: string
          updated_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          version: string | null
        }
        Insert: {
          content?: string | null
          content_hash?: string | null
          created_at?: string
          document_type?: string | null
          id?: string
          language?: string | null
          metadata?: Json
          organization_id?: string | null
          source_id?: string | null
          title: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          version?: string | null
        }
        Update: {
          content?: string | null
          content_hash?: string | null
          created_at?: string
          document_type?: string | null
          id?: string
          language?: string | null
          metadata?: Json
          organization_id?: string | null
          source_id?: string | null
          title?: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_documents_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          authority_level: string
          created_at: string
          id: string
          license_notes: string | null
          metadata: Json
          name: string
          organization_id: string | null
          publisher: string | null
          source_type: string
          source_url: string | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          authority_level?: string
          created_at?: string
          id?: string
          license_notes?: string | null
          metadata?: Json
          name: string
          organization_id?: string | null
          publisher?: string | null
          source_type: string
          source_url?: string | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          authority_level?: string
          created_at?: string
          id?: string
          license_notes?: string | null
          metadata?: Json
          name?: string
          organization_id?: string | null
          publisher?: string | null
          source_type?: string
          source_url?: string | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_catalog: {
        Row: {
          created_at: string
          default_risk_level: string
          description: string | null
          domain: string | null
          enabled: boolean
          id: string
          operation_key: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_risk_level?: string
          description?: string | null
          domain?: string | null
          enabled?: boolean
          id?: string
          operation_key: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_risk_level?: string
          description?: string | null
          domain?: string | null
          enabled?: boolean
          id?: string
          operation_key?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_catalog_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      orchestration_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: Json | null
          execution_plan: Json
          id: string
          objective: string
          organization_id: string
          parent_run_id: string | null
          result: Json
          routing: Json
          started_at: string | null
          status: string
          task_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: Json | null
          execution_plan?: Json
          id?: string
          objective: string
          organization_id: string
          parent_run_id?: string | null
          result?: Json
          routing?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: Json | null
          execution_plan?: Json
          id?: string
          objective?: string
          organization_id?: string
          parent_run_id?: string | null
          result?: Json
          routing?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orchestration_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orchestration_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "orchestration_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orchestration_runs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string | null
          customer_id: string | null
          id: string
          metadata: Json
          order_number: string
          organization_id: string | null
          shipping_cost: number | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          id?: string
          metadata?: Json
          order_number: string
          organization_id?: string | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          id?: string
          metadata?: Json
          order_number?: string
          organization_id?: string | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string | null
          settings: Json
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id?: string | null
          settings?: Json
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string | null
          settings?: Json
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          confidence: number | null
          created_at: string
          expert_id: string | null
          id: string
          organization_id: string | null
          prediction: string
          subject: string
          target_date: string | null
          task_id: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          expert_id?: string | null
          id?: string
          organization_id?: string | null
          prediction: string
          subject: string
          target_date?: string | null
          task_id?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          expert_id?: string | null
          id?: string
          organization_id?: string | null
          prediction?: string
          subject?: string
          target_date?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          collection_id: string
          position: number
          product_id: string
        }
        Insert: {
          collection_id: string
          position?: number
          product_id: string
        }
        Update: {
          collection_id?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_fabrics: {
        Row: {
          created_at: string
          fabric_id: string
          id: string
          product_id: string
          quantity_m2: number
          usage_type: string | null
        }
        Insert: {
          created_at?: string
          fabric_id: string
          id?: string
          product_id: string
          quantity_m2?: number
          usage_type?: string | null
        }
        Update: {
          created_at?: string
          fabric_id?: string
          id?: string
          product_id?: string
          quantity_m2?: number
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_fabrics_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_fabrics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          organization_id: string | null
          product_id: string | null
          production_data: Json
          quantity: number
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          organization_id?: string | null
          product_id?: string | null
          production_data?: Json
          quantity?: number
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          organization_id?: string | null
          product_id?: string | null
          production_data?: Json
          quantity?: number
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          costing_data: Json
          created_at: string
          description: string | null
          design_data: Json
          id: string
          metadata: Json
          name: string
          organization_id: string | null
          product_type: string | null
          production_data: Json
          project_id: string | null
          sku: string | null
          status: string
          updated_at: string
        }
        Insert: {
          costing_data?: Json
          created_at?: string
          description?: string | null
          design_data?: Json
          id?: string
          metadata?: Json
          name: string
          organization_id?: string | null
          product_type?: string | null
          production_data?: Json
          project_id?: string | null
          sku?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          costing_data?: Json
          created_at?: string
          description?: string | null
          design_data?: Json
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string | null
          product_type?: string | null
          production_data?: Json
          project_id?: string | null
          sku?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          organization_id: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      routing_rules: {
        Row: {
          complexity: string | null
          conditions: Json
          created_at: string
          enabled: boolean
          fallback_risk_level: string
          id: string
          max_cost_usd: number | null
          max_tokens: number | null
          name: string
          operation_key: string | null
          organization_id: string | null
          preferred_expert_id: string | null
          preferred_model_id: string | null
          priority: number
          requires_evaluation: boolean
          risk_level: string
          task_type: string | null
          updated_at: string
        }
        Insert: {
          complexity?: string | null
          conditions?: Json
          created_at?: string
          enabled?: boolean
          fallback_risk_level?: string
          id?: string
          max_cost_usd?: number | null
          max_tokens?: number | null
          name: string
          operation_key?: string | null
          organization_id?: string | null
          preferred_expert_id?: string | null
          preferred_model_id?: string | null
          priority?: number
          requires_evaluation?: boolean
          risk_level?: string
          task_type?: string | null
          updated_at?: string
        }
        Update: {
          complexity?: string | null
          conditions?: Json
          created_at?: string
          enabled?: boolean
          fallback_risk_level?: string
          id?: string
          max_cost_usd?: number | null
          max_tokens?: number | null
          name?: string
          operation_key?: string | null
          organization_id?: string | null
          preferred_expert_id?: string | null
          preferred_model_id?: string | null
          priority?: number
          requires_evaluation?: boolean
          risk_level?: string
          task_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_preferred_expert_id_fkey"
            columns: ["preferred_expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_preferred_model_id_fkey"
            columns: ["preferred_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_fabrics: {
        Row: {
          active: boolean
          currency: string | null
          fabric_id: string
          lead_time_days: number | null
          metadata: Json
          min_order_m2: number | null
          price_per_m2: number | null
          supplier_id: string
          supplier_sku: string | null
        }
        Insert: {
          active?: boolean
          currency?: string | null
          fabric_id: string
          lead_time_days?: number | null
          metadata?: Json
          min_order_m2?: number | null
          price_per_m2?: number | null
          supplier_id: string
          supplier_sku?: string | null
        }
        Update: {
          active?: boolean
          currency?: string | null
          fabric_id?: string
          lead_time_days?: number | null
          metadata?: Json
          min_order_m2?: number | null
          price_per_m2?: number | null
          supplier_id?: string
          supplier_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_fabrics_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_fabrics_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          certifications: Json
          city: string | null
          contact_data: Json
          country: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          organization_id: string | null
          rating: number | null
          specialties: Json
          supplier_code: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          certifications?: Json
          city?: string | null
          contact_data?: Json
          country?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          organization_id?: string | null
          rating?: number | null
          specialties?: Json
          supplier_code?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          certifications?: Json
          city?: string | null
          contact_data?: Json
          country?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string | null
          rating?: number | null
          specialties?: Json
          supplier_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_directives: {
        Row: {
          active: boolean
          created_at: string
          directive: string
          directive_key: string
          id: string
          metadata: Json
          organization_id: string
          priority: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          directive: string
          directive_key: string
          id?: string
          metadata?: Json
          organization_id: string
          priority?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          directive?: string
          directive_key?: string
          id?: string
          metadata?: Json
          organization_id?: string
          priority?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_directives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      task_runs: {
        Row: {
          approval_request_id: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          attempt_no: number
          cached_tokens: number | null
          completed_at: string | null
          cost_usd: number | null
          created_at: string
          error: Json | null
          expert_id: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model_id: string | null
          output_tokens: number | null
          result: Json
          risk_level: string
          status: string
          task_id: string
          tool_id: string | null
        }
        Insert: {
          approval_request_id?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          attempt_no?: number
          cached_tokens?: number | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string
          error?: Json | null
          expert_id?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          output_tokens?: number | null
          result?: Json
          risk_level?: string
          status?: string
          task_id: string
          tool_id?: string | null
        }
        Update: {
          approval_request_id?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          attempt_no?: number
          cached_tokens?: number | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string
          error?: Json | null
          expert_id?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          output_tokens?: number | null
          result?: Json
          risk_level?: string
          status?: string
          task_id?: string
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_runs_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "human_approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_runs_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_runs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_runs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_runs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          budget_usd: number | null
          completed_at: string | null
          complexity: string
          constraints: Json
          created_at: string
          id: string
          input: Json
          organization_id: string
          output: Json
          parent_task_id: string | null
          priority: number
          project_id: string | null
          requested_by: string | null
          started_at: string | null
          status: string
          task_type: string | null
          title: string
          token_budget: number | null
          updated_at: string
        }
        Insert: {
          budget_usd?: number | null
          completed_at?: string | null
          complexity?: string
          constraints?: Json
          created_at?: string
          id?: string
          input?: Json
          organization_id: string
          output?: Json
          parent_task_id?: string | null
          priority?: number
          project_id?: string | null
          requested_by?: string | null
          started_at?: string | null
          status?: string
          task_type?: string | null
          title: string
          token_budget?: number | null
          updated_at?: string
        }
        Update: {
          budget_usd?: number | null
          completed_at?: string | null
          complexity?: string
          constraints?: Json
          created_at?: string
          id?: string
          input?: Json
          organization_id?: string
          output?: Json
          parent_task_id?: string | null
          priority?: number
          project_id?: string | null
          requested_by?: string | null
          started_at?: string | null
          status?: string
          task_type?: string | null
          title?: string
          token_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_performance_log: {
        Row: {
          business_result: Json
          capability_id: string | null
          cost_usd: number
          created_at: string
          deprecated: boolean
          deprecated_at: string | null
          deprecation_reason: string | null
          error_count: number
          human_approved: boolean | null
          id: string
          integration_id: string | null
          latency_ms: number | null
          model_name: string | null
          notes: string | null
          organization_id: string
          outcome: string | null
          quality_score: number | null
          task_id: string | null
          tool_name: string | null
        }
        Insert: {
          business_result?: Json
          capability_id?: string | null
          cost_usd?: number
          created_at?: string
          deprecated?: boolean
          deprecated_at?: string | null
          deprecation_reason?: string | null
          error_count?: number
          human_approved?: boolean | null
          id?: string
          integration_id?: string | null
          latency_ms?: number | null
          model_name?: string | null
          notes?: string | null
          organization_id: string
          outcome?: string | null
          quality_score?: number | null
          task_id?: string | null
          tool_name?: string | null
        }
        Update: {
          business_result?: Json
          capability_id?: string | null
          cost_usd?: number
          created_at?: string
          deprecated?: boolean
          deprecated_at?: string | null
          deprecation_reason?: string | null
          error_count?: number
          human_approved?: boolean | null
          id?: string
          integration_id?: string | null
          latency_ms?: number | null
          model_name?: string | null
          notes?: string | null
          organization_id?: string
          outcome?: string | null
          quality_score?: number | null
          task_id?: string | null
          tool_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_performance_log_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_performance_log_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_performance_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_performance_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          created_at: string
          error: Json | null
          finished_at: string | null
          id: string
          input: Json
          organization_id: string
          output: Json
          started_at: string | null
          status: string
          task_id: string | null
          workflow_template_id: string | null
        }
        Insert: {
          created_at?: string
          error?: Json | null
          finished_at?: string | null
          id?: string
          input?: Json
          organization_id: string
          output?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
          workflow_template_id?: string | null
        }
        Update: {
          created_at?: string
          error?: Json | null
          finished_at?: string | null
          id?: string
          input?: Json
          organization_id?: string
          output?: Json
          started_at?: string | null
          status?: string
          task_id?: string | null
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          organization_id: string
          purpose: string | null
          steps: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          organization_id: string
          purpose?: string | null
          steps?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          organization_id?: string
          purpose?: string | null
          steps?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_member: { Args: { target_org: string }; Returns: boolean }
      match_knowledge_chunks: {
        Args: {
          filter_organization_id?: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
