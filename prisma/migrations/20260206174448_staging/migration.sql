-- CreateTable
CREATE TABLE "alembic_version" (
    "version_num" TEXT NOT NULL,

    CONSTRAINT "alembic_version_pkey" PRIMARY KEY ("version_num")
);

-- CreateTable
CREATE TABLE "appointment_archive" (
    "appointment_id" INTEGER NOT NULL,
    "office_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "checked_in_time" TIMESTAMP(6),
    "comments" VARCHAR(255),
    "citizen_name" VARCHAR(255) NOT NULL,
    "contact_information" VARCHAR(255),
    "service_id" INTEGER,
    "blackout_flag" VARCHAR(1) NOT NULL DEFAULT 'N',
    "citizen_id" INTEGER,
    "recurring_uuid" VARCHAR(255),
    "online_flag" BOOLEAN,
    "is_draft" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "stat_flag" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP(6),
    "updated_by" TEXT,

    CONSTRAINT "appointment_archive_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "appointment_archive_selection" (
    "appointment_id" INTEGER NOT NULL,
    "citizen_id" INTEGER,
    "office_id" INTEGER,

    CONSTRAINT "appointment_archive_selection_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "appointment" (
    "appointment_id" SERIAL NOT NULL,
    "office_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "checked_in_time" TIMESTAMP(6),
    "comments" VARCHAR(255),
    "citizen_name" VARCHAR(255) NOT NULL,
    "contact_information" VARCHAR(255),
    "service_id" INTEGER,
    "blackout_flag" VARCHAR(1) NOT NULL DEFAULT 'N',
    "citizen_id" INTEGER,
    "recurring_uuid" VARCHAR(255),
    "online_flag" BOOLEAN,
    "is_draft" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "stat_flag" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP(6),
    "updated_by" TEXT,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "appointment_version" (
    "appointment_id" INTEGER NOT NULL,
    "office_id" INTEGER,
    "service_id" INTEGER,
    "citizen_id" INTEGER,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "checked_in_time" TIMESTAMP(6),
    "comments" VARCHAR(255),
    "citizen_name" VARCHAR(255),
    "contact_information" VARCHAR(255),
    "blackout_flag" VARCHAR(1),
    "recurring_uuid" VARCHAR(255),
    "online_flag" BOOLEAN,
    "is_draft" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "stat_flag" BOOLEAN,
    "updated_at" TIMESTAMP(6),
    "updated_by" TEXT,
    "transaction_id" INTEGER NOT NULL,
    "end_transaction_id" INTEGER,
    "operation_type" INTEGER NOT NULL,

    CONSTRAINT "appointment_version_pkey" PRIMARY KEY ("appointment_id","transaction_id")
);

-- CreateTable
CREATE TABLE "appointment_version_archive" (
    "appointment_id" INTEGER NOT NULL,
    "office_id" INTEGER,
    "service_id" INTEGER,
    "citizen_id" INTEGER,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "checked_in_time" TIMESTAMP(6),
    "comments" VARCHAR(255),
    "citizen_name" VARCHAR(255),
    "contact_information" VARCHAR(255),
    "blackout_flag" VARCHAR(1),
    "recurring_uuid" VARCHAR(255),
    "online_flag" BOOLEAN,
    "is_draft" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "stat_flag" BOOLEAN,
    "updated_at" TIMESTAMP(6),
    "updated_by" TEXT,
    "transaction_id" INTEGER NOT NULL,
    "end_transaction_id" INTEGER,
    "operation_type" INTEGER NOT NULL,

    CONSTRAINT "appointment_version_archive_pkey" PRIMARY KEY ("appointment_id","transaction_id")
);

-- CreateTable
CREATE TABLE "archive" (
    "archive_id" INTEGER NOT NULL,
    "table_name" VARCHAR(255) NOT NULL,
    "archive_date" TIMESTAMP(6) NOT NULL,
    "id_min" INTEGER,
    "id_max" INTEGER,
    "count" INTEGER,

    CONSTRAINT "archive_pkey" PRIMARY KEY ("archive_id")
);

-- CreateTable
CREATE TABLE "booking" (
    "booking_id" SERIAL NOT NULL,
    "room_id" INTEGER,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "fees" VARCHAR(5),
    "booking_name" VARCHAR(150),
    "office_id" INTEGER NOT NULL,
    "sbc_staff_invigilated" INTEGER,
    "booking_contact_information" VARCHAR(256),
    "shadow_invigilator_id" INTEGER,
    "blackout_flag" VARCHAR(1) NOT NULL DEFAULT 'N',
    "blackout_notes" VARCHAR(255),
    "recurring_uuid" VARCHAR(255),
    "stat_flag" BOOLEAN NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "booking_invigilators" (
    "booking_id" INTEGER NOT NULL,
    "invigilator_id" INTEGER NOT NULL,

    CONSTRAINT "booking_invigilators_pkey" PRIMARY KEY ("booking_id","invigilator_id")
);

-- CreateTable
CREATE TABLE "channel" (
    "channel_id" SERIAL NOT NULL,
    "channel_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("channel_id")
);

-- CreateTable
CREATE TABLE "citizen_archive" (
    "citizen_id" SERIAL NOT NULL,
    "office_id" INTEGER NOT NULL,
    "ticket_number" VARCHAR(50),
    "citizen_name" VARCHAR(150),
    "citizen_comments" VARCHAR(1000),
    "qt_xn_citizen_ind" INTEGER NOT NULL,
    "cs_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "accurate_time_ind" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,
    "counter_id" INTEGER,
    "user_id" INTEGER,
    "automatic_reminder_flag" INTEGER,
    "notification_email" VARCHAR(100),
    "notification_phone" VARCHAR(100),
    "notification_sent_time" TIMESTAMP(3),
    "reminder_flag" INTEGER,
    "walkin_unique_id" VARCHAR(500),
    "created_at" TIMESTAMP(6),
    "start_position" INTEGER,

    CONSTRAINT "citizen_archive_pkey" PRIMARY KEY ("citizen_id")
);

-- CreateTable
CREATE TABLE "citizen" (
    "citizen_id" SERIAL NOT NULL,
    "office_id" INTEGER NOT NULL,
    "ticket_number" VARCHAR(50),
    "citizen_name" VARCHAR(150),
    "citizen_comments" VARCHAR(1000),
    "qt_xn_citizen_ind" INTEGER NOT NULL,
    "cs_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "accurate_time_ind" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,
    "counter_id" INTEGER,
    "user_id" INTEGER,
    "automatic_reminder_flag" INTEGER,
    "notification_email" VARCHAR(100),
    "notification_phone" VARCHAR(100),
    "notification_sent_time" TIMESTAMP(3),
    "reminder_flag" INTEGER,
    "walkin_unique_id" VARCHAR(500),
    "created_at" TIMESTAMP(6),
    "start_position" INTEGER,

    CONSTRAINT "citizen_pkey" PRIMARY KEY ("citizen_id")
);

-- CreateTable
CREATE TABLE "citizenstate" (
    "cs_id" SERIAL NOT NULL,
    "cs_state_name" VARCHAR(100) NOT NULL,
    "cs_state_desc" VARCHAR(1000) NOT NULL,

    CONSTRAINT "citizenstate_pkey" PRIMARY KEY ("cs_id")
);

-- CreateTable
CREATE TABLE "counter" (
    "counter_id" SERIAL NOT NULL,
    "counter_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "counter_pkey" PRIMARY KEY ("counter_id")
);

-- CreateTable
CREATE TABLE "csrstate" (
    "csr_state_id" SERIAL NOT NULL,
    "csr_state_name" VARCHAR(50) NOT NULL,
    "csr_state_desc" VARCHAR(1000) NOT NULL,

    CONSTRAINT "csrstate_pkey" PRIMARY KEY ("csr_state_id")
);

-- CreateTable
CREATE TABLE "exam" (
    "exam_id" SERIAL NOT NULL,
    "booking_id" INTEGER,
    "exam_type_id" INTEGER,
    "office_id" INTEGER NOT NULL,
    "event_id" VARCHAR(25),
    "exam_name" VARCHAR(50) NOT NULL,
    "examinee_name" VARCHAR(50),
    "expiry_date" TIMESTAMP(6),
    "notes" VARCHAR(400),
    "session_number" INTEGER,
    "number_of_students" INTEGER,
    "exam_method" VARCHAR(15) NOT NULL,
    "deleted_date" TEXT,
    "exam_received_date" TIMESTAMP(6),
    "exam_returned_tracking_number" VARCHAR(255),
    "offsite_location" VARCHAR(255),
    "exam_returned_date" TIMESTAMP(6),
    "exam_written_ind" INTEGER NOT NULL,
    "bcmp_job_id" VARCHAR(100),
    "exam_destroyed_date" TEXT,
    "upload_received_ind" INTEGER,
    "payee_email" VARCHAR(50),
    "payee_ind" INTEGER,
    "payee_name" VARCHAR(50),
    "payee_phone" VARCHAR(50),
    "receipt" VARCHAR(50),
    "receipt_sent_ind" INTEGER,
    "sbc_managed_ind" INTEGER,
    "examinee_email" VARCHAR(400),
    "examinee_phone" VARCHAR(400),
    "invigilator_id" INTEGER,
    "candidates_list" JSONB,
    "is_pesticide" INTEGER,

    CONSTRAINT "exam_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "examtype" (
    "exam_type_id" SERIAL NOT NULL,
    "exam_type_name" VARCHAR(50) NOT NULL,
    "exam_color" VARCHAR(10) NOT NULL,
    "number_of_hours" INTEGER NOT NULL,
    "method_type" VARCHAR(10) NOT NULL,
    "ita_ind" INTEGER NOT NULL,
    "group_exam_ind" INTEGER NOT NULL,
    "pesticide_exam_ind" INTEGER NOT NULL,
    "number_of_minutes" INTEGER,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "examtype_pkey" PRIMARY KEY ("exam_type_id")
);

-- CreateTable
CREATE TABLE "invigilator" (
    "invigilator_id" SERIAL NOT NULL,
    "office_id" INTEGER NOT NULL,
    "invigilator_name" VARCHAR(50) NOT NULL,
    "invigilator_notes" VARCHAR(400),
    "contact_phone" VARCHAR(15),
    "contact_email" VARCHAR(50),
    "contract_number" VARCHAR(50) NOT NULL,
    "contract_expiry_date" VARCHAR(50) NOT NULL,
    "deleted" TIMESTAMP(6),
    "shadow_count" INTEGER NOT NULL DEFAULT 2,
    "shadow_flag" VARCHAR(1) NOT NULL DEFAULT 'Y',

    CONSTRAINT "invigilator_pkey" PRIMARY KEY ("invigilator_id")
);

-- CreateTable
CREATE TABLE "office" (
    "office_id" SERIAL NOT NULL,
    "office_name" VARCHAR(100),
    "office_number" INTEGER,
    "sb_id" INTEGER,
    "deleted" TIMESTAMP(6),
    "exams_enabled_ind" INTEGER NOT NULL,
    "appointments_enabled_ind" INTEGER NOT NULL,
    "timezone_id" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "office_appointment_message" TEXT,
    "appointments_days_limit" INTEGER,
    "appointment_duration" INTEGER,
    "max_person_appointment_per_day" INTEGER,
    "civic_address" VARCHAR(200),
    "telephone" VARCHAR(20),
    "online_status" TEXT,
    "number_of_dlkt" INTEGER,
    "office_email_paragraph" TEXT,
    "external_map_link" TEXT,
    "soonest_appointment" INTEGER,
    "automatic_reminder_at" INTEGER,
    "check_in_notification" INTEGER,
    "check_in_reminder_msg" TEXT,
    "currently_waiting" INTEGER,
    "digital_signage_message" INTEGER,
    "digital_signage_message_1" TEXT,
    "digital_signage_message_2" TEXT,
    "digital_signage_message_3" TEXT,
    "show_currently_waiting_bottom" INTEGER,
    "optout_status" INTEGER DEFAULT 0,

    CONSTRAINT "office_pkey" PRIMARY KEY ("office_id")
);

-- CreateTable
CREATE TABLE "office_back_office_list" (
    "office_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "office_back_office_list_pkey" PRIMARY KEY ("office_id","service_id")
);

-- CreateTable
CREATE TABLE "office_counter" (
    "office_id" INTEGER NOT NULL,
    "counter_id" INTEGER NOT NULL,

    CONSTRAINT "office_counter_pkey" PRIMARY KEY ("office_id","counter_id")
);

-- CreateTable
CREATE TABLE "office_quick_list" (
    "office_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "office_quick_list_pkey" PRIMARY KEY ("office_id","service_id")
);

-- CreateTable
CREATE TABLE "office_service" (
    "office_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "office_service_pkey" PRIMARY KEY ("office_id","service_id")
);

-- CreateTable
CREATE TABLE "office_sharepoint" (
    "office_number" INTEGER NOT NULL,
    "office_name" VARCHAR(100) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "civic_address" VARCHAR(200),
    "telephone" VARCHAR(20),

    CONSTRAINT "office_sharepoint_pkey" PRIMARY KEY ("office_number")
);

-- CreateTable
CREATE TABLE "office_timeslot" (
    "office_id" INTEGER NOT NULL,
    "time_slot_id" INTEGER NOT NULL,

    CONSTRAINT "office_timeslot_pkey" PRIMARY KEY ("office_id","time_slot_id")
);

-- CreateTable
CREATE TABLE "period" (
    "period_id" SERIAL NOT NULL,
    "sr_id" INTEGER NOT NULL,
    "csr_id" INTEGER NOT NULL,
    "reception_csr_ind" INTEGER NOT NULL,
    "ps_id" INTEGER NOT NULL,
    "time_start" TIMESTAMP(6) NOT NULL,
    "time_end" TIMESTAMP(6),

    CONSTRAINT "period_pkey" PRIMARY KEY ("period_id")
);

-- CreateTable
CREATE TABLE "period_archive" (
    "period_id" SERIAL NOT NULL,
    "sr_id" INTEGER NOT NULL,
    "csr_id" INTEGER NOT NULL,
    "reception_csr_ind" INTEGER NOT NULL,
    "ps_id" INTEGER NOT NULL,
    "time_start" TIMESTAMP(6) NOT NULL,
    "time_end" TIMESTAMP(6),

    CONSTRAINT "period_archive_pkey" PRIMARY KEY ("period_id")
);

-- CreateTable
CREATE TABLE "periodstate" (
    "ps_id" SERIAL NOT NULL,
    "ps_name" VARCHAR(100) NOT NULL,
    "ps_desc" VARCHAR(1000) NOT NULL,
    "ps_number" INTEGER NOT NULL,

    CONSTRAINT "periodstate_pkey" PRIMARY KEY ("ps_id")
);

-- CreateTable
CREATE TABLE "publicuser" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(100),
    "display_name" VARCHAR(200),
    "last_name" VARCHAR(200),
    "email" VARCHAR(200),
    "telephone" VARCHAR(20),
    "send_email_reminders" BOOLEAN NOT NULL,
    "send_sms_reminders" BOOLEAN NOT NULL,

    CONSTRAINT "publicuser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "role_code" VARCHAR(100),
    "role_desc" VARCHAR(1000),

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "room" (
    "room_id" SERIAL NOT NULL,
    "office_id" INTEGER NOT NULL,
    "room_name" VARCHAR(50) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "color" VARCHAR(25) NOT NULL,
    "deleted" TIMESTAMP(6),

    CONSTRAINT "room_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "service" (
    "service_id" SERIAL NOT NULL,
    "service_code" VARCHAR(50) NOT NULL,
    "service_name" VARCHAR(500) NOT NULL,
    "service_desc" VARCHAR(2000) NOT NULL,
    "parent_id" INTEGER,
    "deleted" TIMESTAMP(6),
    "prefix" VARCHAR(10) NOT NULL,
    "display_dashboard_ind" INTEGER NOT NULL,
    "actual_service_ind" INTEGER NOT NULL,
    "external_service_name" VARCHAR(500),
    "online_availability" TEXT,
    "online_link" VARCHAR(500),
    "timeslot_duration" INTEGER,
    "is_dlkt" TEXT,
    "email_paragraph" TEXT,
    "css_colour" VARCHAR(50),

    CONSTRAINT "service_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "service_metadata" (
    "service_id" INTEGER NOT NULL,
    "metadata_id" INTEGER NOT NULL,

    CONSTRAINT "service_metadata_pkey" PRIMARY KEY ("service_id","metadata_id")
);

-- CreateTable
CREATE TABLE "servicereq" (
    "sr_id" SERIAL NOT NULL,
    "citizen_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "sr_state_id" INTEGER NOT NULL,
    "sr_number" INTEGER NOT NULL,

    CONSTRAINT "servicereq_pkey" PRIMARY KEY ("sr_id")
);

-- CreateTable
CREATE TABLE "servicereq_archive" (
    "sr_id" SERIAL NOT NULL,
    "citizen_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "sr_state_id" INTEGER NOT NULL,
    "sr_number" INTEGER NOT NULL,

    CONSTRAINT "servicereq_archive_pkey" PRIMARY KEY ("sr_id")
);

-- CreateTable
CREATE TABLE "smartboard" (
    "sb_id" SERIAL NOT NULL,
    "sb_type" VARCHAR(45) NOT NULL,

    CONSTRAINT "smartboard_pkey" PRIMARY KEY ("sb_id")
);

-- CreateTable
CREATE TABLE "srstate" (
    "sr_state_id" SERIAL NOT NULL,
    "sr_code" VARCHAR(100) NOT NULL,
    "sr_state_desc" VARCHAR(1000) NOT NULL,

    CONSTRAINT "srstate_pkey" PRIMARY KEY ("sr_state_id")
);

-- CreateTable
CREATE TABLE "timeslot" (
    "time_slot_id" SERIAL NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "no_of_slots" INTEGER NOT NULL,
    "day_of_week" TEXT[],
    "office_id" INTEGER,

    CONSTRAINT "timeslot_pkey" PRIMARY KEY ("time_slot_id")
);

-- CreateTable
CREATE TABLE "timeslot_bkup" (
    "time_slot_id" SERIAL NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "no_of_slots" INTEGER,
    "day_of_week" TEXT[],

    CONSTRAINT "timeslot_bkup_pkey" PRIMARY KEY ("time_slot_id")
);

-- CreateTable
CREATE TABLE "timezone" (
    "timezone_id" SERIAL NOT NULL,
    "timezone_name" VARCHAR(256) NOT NULL,

    CONSTRAINT "timezone_pkey" PRIMARY KEY ("timezone_id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "issued_at" TIMESTAMP(3),
    "remote_addr" VARCHAR(50),

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_archive" (
    "id" SERIAL NOT NULL,
    "issued_at" TIMESTAMP(3),
    "remote_addr" VARCHAR(50),

    CONSTRAINT "transaction_archive_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "office"("office_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "citizen"("citizen_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("service_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_version" ADD CONSTRAINT "appointment_version_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_version" ADD CONSTRAINT "appointment_version_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "office"("office_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_version" ADD CONSTRAINT "appointment_version_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_version_archive" ADD CONSTRAINT "appointment_version_archive_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_version_archive" ADD CONSTRAINT "appointment_version_archive_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "office"("office_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_version_archive" ADD CONSTRAINT "appointment_version_archive_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen" ADD CONSTRAINT "citizen_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "office"("office_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr" ADD CONSTRAINT "csr_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "office"("office_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr" ADD CONSTRAINT "csr_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr" ADD CONSTRAINT "csr_csr_state_id_fkey" FOREIGN KEY ("csr_state_id") REFERENCES "csrstate"("csr_state_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr" ADD CONSTRAINT "csr_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "counter"("counter_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period" ADD CONSTRAINT "period_sr_id_fkey" FOREIGN KEY ("sr_id") REFERENCES "servicereq"("sr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period" ADD CONSTRAINT "period_csr_id_fkey" FOREIGN KEY ("csr_id") REFERENCES "csr"("csr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicereq" ADD CONSTRAINT "servicereq_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "citizen"("citizen_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicereq" ADD CONSTRAINT "servicereq_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicereq" ADD CONSTRAINT "servicereq_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel"("channel_id") ON DELETE RESTRICT ON UPDATE CASCADE;
