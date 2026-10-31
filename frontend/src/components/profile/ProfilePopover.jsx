import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, MailCheck, MailX } from "lucide-react";
import {
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "../ui/popover";
import TwoStepVerificationControl from "./TwoStepVerificationControl";
import { useRef } from "react";
import { axiosInstance } from "@/axios";
import { toast } from "../ui/toast";

const ROLE_LABEL = { 0: "User", 1: "Admin" };

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(firstName, lastName) {
  const a = firstName?.[0] ?? "";
  const b = lastName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-8 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>
        {value ?? <span className="text-muted-foreground">Not provided</span>}
      </span>
    </div>
  );
}

export default function ProfilePopover({
  user,
  onTwoStepVerificationEnabled,
  onImageChange,
  imageKey,
}) {
  const displayName =
    user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");

  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("image", file);

    try {
      const { success, message, data } = await axiosInstance.post(
        "users/upload",
        formData,
      );

      toast.add({
        type: success ? "success" : "error",
        description: message,
      });

      if (success) {
        onImageChange(data.image);
      }
    } catch (error) {
      toast.add({
        type: "error",
        description: error.message,
      });
    }
  };

  return (
    <PopoverContent align="start">
      <PopoverHeader className="flex-row gap-4 mb-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Avatar
          className="size-12 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <AvatarImage
            key={imageKey}
            src={
              user.image ? `${import.meta.env.VITE_API_URL}/${user.image}` : ""
            }
            alt={displayName}
          />
          <AvatarFallback>
            {initials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <PopoverTitle className="font-display text-lg">
            {displayName}
          </PopoverTitle>
          <PopoverDescription className="flex items-center gap-1.5">
            {user.emailConfirmed ? (
              <MailCheck className="size-5" />
            ) : user.emailConfirmed === false ? (
              <MailX className="size-5" />
            ) : (
              <Mail className="size-5" />
            )}
            <span className="truncate">{user.email}</span>
          </PopoverDescription>
        </div>
      </PopoverHeader>

      <div className="mb-2 flex gap-2">
        <Badge variant="secondary">{ROLE_LABEL[user.role] ?? "User"}</Badge>
        <Badge variant="outline">{user.provider ?? "local"}</Badge>
      </div>

      <Separator />

      <Field label="Phone" value={user.phone} />
      <Field label="Age" value={user.age} />
      <Field
        label="Gender"
        value={
          user.gender && user.gender[0].toUpperCase() + user.gender.slice(1)
        }
      />

      <Separator className="my-2" />

      <Field
        label="Two-step verification"
        value={
          user.provider === "local"
            ? user.twoStepVerificationEnabled
              ? "Enabled"
              : "Disabled"
            : "Not available"
        }
      />
      {user.provider === "local" && (
        <TwoStepVerificationControl
          user={user}
          onEnabled={onTwoStepVerificationEnabled}
        />
      )}

      <Separator className="my-2" />

      <Field label="Joined" value={formatDate(user.createdAt)} />
      <Field label="Last updated" value={formatDate(user.updatedAt)} />
    </PopoverContent>
  );
}
