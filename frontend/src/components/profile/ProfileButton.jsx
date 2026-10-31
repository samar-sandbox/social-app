import { useState } from "react";
import { axiosInstance } from "@/axios";
import { Button } from "../ui/button";
import { Loader2, User } from "lucide-react";
import { toast } from "../ui/toast";
import ProfilePopover from "./ProfilePopover";
import { Popover, PopoverTrigger } from "../ui/popover";

export default function ProfileButton() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const handleGetProfile = async () => {
    if (profile) return;

    setLoading(true);
    try {
      const { success, message, data } =
        await axiosInstance.get("/users/profile");

      if (success) {
        setProfile(data);
      } else {
        toast.add({
          type: "error",
          description: message,
        });
      }
    } catch (error) {
      toast.add({ type: "error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button onClick={handleGetProfile} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading..
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Profile
              </>
            )}
          </Button>
        }
      />

      {profile && (
        <ProfilePopover
          user={profile}
          imageKey={imageKey}
          onTwoStepVerificationEnabled={() =>
            setProfile((currentProfile) => ({
              ...currentProfile,
              twoStepVerificationEnabled: true,
              emailConfirmed: true,
            }))
          }
          onImageChange={(image) => {
            setProfile((currentProfile) => ({
              ...currentProfile,
              image,
            }));
            setImageKey((k) => k + 1);
          }}
        />
      )}
    </Popover>
  );
}
